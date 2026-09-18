import { Construct } from "constructs";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { Route53Zone } from "@cdktf/provider-aws/lib/route53-zone";
import { Route53Record } from "@cdktf/provider-aws/lib/route53-record";
import { AcmCertificate } from "@cdktf/provider-aws/lib/acm-certificate";
import { AcmCertificateValidation } from "@cdktf/provider-aws/lib/acm-certificate-validation";
import { S3Bucket } from "@cdktf/provider-aws/lib/s3-bucket";
import { S3BucketPublicAccessBlock } from "@cdktf/provider-aws/lib/s3-bucket-public-access-block";
import { S3BucketPolicy } from "@cdktf/provider-aws/lib/s3-bucket-policy";
import { S3Object } from "@cdktf/provider-aws/lib/s3-object";
import { DataAwsIamPolicyDocument } from "@cdktf/provider-aws/lib/data-aws-iam-policy-document";
import { CloudfrontOriginAccessControl } from "@cdktf/provider-aws/lib/cloudfront-origin-access-control";
import { CloudfrontDistribution } from "@cdktf/provider-aws/lib/cloudfront-distribution";

// AWS's managed "CachingOptimized" cache policy. Using the managed policy ID
// directly is the current recommended approach — the older `forwardedValues`
// block on a cache behavior still works but is deprecated by AWS.
const CACHING_OPTIMIZED_POLICY_ID = "658327ea-f89d-4fab-a63d-7e88639e58f6";

// AWS's managed "CachingDisabled" policy — used for the /api/resume/*
// behavior below. A resume-request POST is never a candidate for CDN
// caching, and disabling it outright is simpler and safer than trying to
// keep a TTL-based policy from ever accidentally serving a cached response
// (or presigned URL!) to the wrong visitor.
const CACHING_DISABLED_POLICY_ID = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad";

// AWS's managed "AllViewer" origin request policy — forwards all viewer
// headers (except Host), query strings, and cookies to the origin. Needed
// so the Lambda origin actually receives the POST body, Content-Type, and
// the CloudFront-Viewer-Country header the handler reads.
const ALL_VIEWER_ORIGIN_REQUEST_POLICY_ID = "216adef6-5c7f-47e4-b989-5492eafa07d3";

export interface StaticSiteApiOriginProps {
  /** Bare hostname (no scheme) of the Lambda Function URL backing this behavior. */
  domainName: string;
  /** Shared secret injected as a custom header on every request CloudFront sends to this origin (see resume-api.ts). */
  originVerifySecret: string;
  /** Path pattern this behavior matches, e.g. "/api/resume/*". */
  pathPattern: string;
}

export interface StaticSiteProps {
  /** The apex domain, e.g. "ch-ai.in". No "www." variant is set up here —
   * see the README for how to extend this if you want one later. */
  domainName: string;
  /** ACM certificates for CloudFront must live in us-east-1 no matter which
   * region the rest of the stack deploys to, so the caller passes in a
   * second, region-pinned provider instance for this one resource. */
  usEast1Provider: AwsProvider;
  /** Optional second origin (a Lambda Function URL) routed by path pattern
   * alongside the S3 origin, so a dynamic endpoint like the resume-request
   * API can live on the same domain with no CORS to manage. Omit for a
   * purely static distribution. */
  apiOrigin?: StaticSiteApiOriginProps;
}

export class StaticSite extends Construct {
  /** Nameservers for the new hosted zone — copy these into your domain
   * registrar's DNS settings once, right after the first deploy. */
  public readonly nameServers: string[];
  public readonly distributionDomainName: string;
  public readonly bucketName: string;

  constructor(scope: Construct, id: string, props: StaticSiteProps) {
    super(scope, id);
    const { domainName, usEast1Provider, apiOrigin } = props;

    // ---------------------------------------------------------------
    // 1. Hosted zone — this becomes the source of truth for DNS once
    //    you point your registrar's nameservers at it.
    // ---------------------------------------------------------------
    const zone = new Route53Zone(this, "zone", {
      name: domainName,
      comment: "Managed by Terraform CDK — personal portfolio",
    });
    this.nameServers = zone.nameServers;

    // ---------------------------------------------------------------
    // 2. TLS certificate, validated via a DNS record CDKTF creates for
    //    you automatically. Must be requested in us-east-1 — that's a
    //    hard CloudFront requirement, not a stylistic choice.
    // ---------------------------------------------------------------
    const cert = new AcmCertificate(this, "cert", {
      provider: usEast1Provider,
      domainName,
      validationMethod: "DNS",
      lifecycle: { createBeforeDestroy: true },
    });

    const validationRecord = new Route53Record(this, "cert-validation-record", {
      zoneId: zone.zoneId,
      name: cert.domainValidationOptions.get(0).resourceRecordName,
      type: cert.domainValidationOptions.get(0).resourceRecordType,
      records: [cert.domainValidationOptions.get(0).resourceRecordValue],
      ttl: 60,
      allowOverwrite: true,
    });

    const certValidation = new AcmCertificateValidation(this, "cert-validation", {
      provider: usEast1Provider,
      certificateArn: cert.arn,
      validationRecordFqdns: [validationRecord.fqdn],
    });

    // ---------------------------------------------------------------
    // 3. The bucket holding your built site. It stays fully private —
    //    CloudFront reads from it via Origin Access Control (OAC), the
    //    current recommended replacement for the older OAI pattern.
    // ---------------------------------------------------------------
    const bucket = new S3Bucket(this, "site-bucket", {
      bucket: `${domainName.replace(/\./g, "-")}-site`,
      // Convenient while you're iterating on infra. Remove once the
      // site holds content you'd be annoyed to lose to a stray `destroy`.
      forceDestroy: true,
    });
    this.bucketName = bucket.bucket;

    new S3BucketPublicAccessBlock(this, "site-bucket-block", {
      bucket: bucket.id,
      blockPublicAcls: true,
      blockPublicPolicy: true,
      ignorePublicAcls: true,
      restrictPublicBuckets: true,
    });

    // A minimal placeholder so the very first deploy already proves the
    // pipeline end to end, instead of showing CloudFront's raw error page.
    new S3Object(this, "placeholder-page", {
      bucket: bucket.id,
      key: "index.html",
      contentType: "text/html",
      content:
        "<!doctype html><html><head><title>Sachin — building something</title>" +
        '<meta name="viewport" content="width=device-width, initial-scale=1"></head>' +
        '<body style="margin:0;display:flex;align-items:center;justify-content:center;' +
        'height:100vh;background:#12100E;color:#EDE6D8;font-family:system-ui,sans-serif;">' +
        "<h1>Building something. Back soon.</h1></body></html>",
    });

    // ---------------------------------------------------------------
    // 4. CloudFront: the OAC resource plus the distribution itself.
    // ---------------------------------------------------------------
    const oac = new CloudfrontOriginAccessControl(this, "oac", {
      name: `${domainName}-oac`,
      originAccessControlOriginType: "s3",
      signingBehavior: "always",
      signingProtocol: "sigv4",
    });

    const API_ORIGIN_ID = "resume-api-origin";

    const distribution = new CloudfrontDistribution(this, "distribution", {
      enabled: true,
      isIpv6Enabled: true,
      defaultRootObject: "index.html",
      aliases: [domainName],
      priceClass: "PriceClass_100", // cheapest tier: North America + Europe edge locations

      origin: [
        {
          originId: "s3-site-origin",
          domainName: bucket.bucketRegionalDomainName,
          originAccessControlId: oac.id,
        },
        // Second origin is entirely optional — only present once the
        // resume-request API exists (see main.ts). Keeping this
        // conditional means StaticSite still works standalone.
        ...(apiOrigin
          ? [
              {
                originId: API_ORIGIN_ID,
                domainName: apiOrigin.domainName,
                customOriginConfig: {
                  httpPort: 80,
                  httpsPort: 443,
                  originProtocolPolicy: "https-only",
                  originSslProtocols: ["TLSv1.2"],
                },
                // CloudFront adds this header to every request it sends to
                // THIS origin, regardless of what the viewer sent — the
                // handler uses it to reject anything that reached the
                // Function URL some other way. See resume-api.ts.
                customHeader: [
                  { name: "X-Origin-Verify", value: apiOrigin.originVerifySecret },
                ],
              },
            ]
          : []),
      ],

      defaultCacheBehavior: {
        allowedMethods: ["GET", "HEAD"],
        cachedMethods: ["GET", "HEAD"],
        targetOriginId: "s3-site-origin",
        viewerProtocolPolicy: "redirect-to-https",
        cachePolicyId: CACHING_OPTIMIZED_POLICY_ID,
      },

      // Only present once apiOrigin is supplied. Matched before the
      // default behavior for any request under this path pattern.
      orderedCacheBehavior: apiOrigin
        ? [
            {
              pathPattern: apiOrigin.pathPattern,
              targetOriginId: API_ORIGIN_ID,
              allowedMethods: ["GET", "HEAD", "OPTIONS", "PUT", "PATCH", "POST", "DELETE"],
              cachedMethods: ["GET", "HEAD"],
              viewerProtocolPolicy: "https-only",
              cachePolicyId: CACHING_DISABLED_POLICY_ID,
              originRequestPolicyId: ALL_VIEWER_ORIGIN_REQUEST_POLICY_ID,
            },
          ]
        : undefined,

      // A static export has no server to resolve client-side routes like
      // /chitraguptha or /blog/some-post on a hard refresh, so unknown
      // paths get sent back to index.html and rendered client-side
      // instead of showing CloudFront's bare 403/404.
      customErrorResponse: [
        { errorCode: 403, responseCode: 200, responsePagePath: "/index.html" },
        { errorCode: 404, responseCode: 200, responsePagePath: "/index.html" },
      ],

      restrictions: {
        geoRestriction: { restrictionType: "none" },
      },

      viewerCertificate: {
        acmCertificateArn: certValidation.certificateArn,
        sslSupportMethod: "sni-only",
        minimumProtocolVersion: "TLSv1.2_2021",
      },
    });
    this.distributionDomainName = distribution.domainName;

    // ---------------------------------------------------------------
    // 5. Bucket policy: only *this* CloudFront distribution may read
    //    from the bucket — not CloudFront in general, not the public.
    // ---------------------------------------------------------------
    const bucketPolicyDoc = new DataAwsIamPolicyDocument(this, "bucket-policy-doc", {
      statement: [
        {
          sid: "AllowCloudFrontServicePrincipalReadOnly",
          effect: "Allow",
          principals: [{ type: "Service", identifiers: ["cloudfront.amazonaws.com"] }],
          actions: ["s3:GetObject"],
          resources: [`${bucket.arn}/*`],
          condition: [
            {
              test: "StringEquals",
              variable: "AWS:SourceArn",
              values: [distribution.arn],
            },
          ],
        },
      ],
    });

    new S3BucketPolicy(this, "bucket-policy", {
      bucket: bucket.id,
      policy: bucketPolicyDoc.json,
    });

    // ---------------------------------------------------------------
    // 6. DNS: alias records so the apex domain resolves straight to
    //    CloudFront (A for IPv4, AAAA for IPv6 — no extra cost either way).
    // ---------------------------------------------------------------
    new Route53Record(this, "apex-alias-a", {
      zoneId: zone.zoneId,
      name: domainName,
      type: "A",
      alias: {
        name: distribution.domainName,
        zoneId: distribution.hostedZoneId,
        evaluateTargetHealth: false,
      },
    });

    new Route53Record(this, "apex-alias-aaaa", {
      zoneId: zone.zoneId,
      name: domainName,
      type: "AAAA",
      alias: {
        name: distribution.domainName,
        zoneId: distribution.hostedZoneId,
        evaluateTargetHealth: false,
      },
    });

    // ---------------------------------------------------------------
    // 7. Email forwarding (ImprovMX) — hello@ch-ai.in -> your inbox.
    //    No mailbox to run: ImprovMX just receives mail for the domain
    //    and relays it. Aliases (which address forwards to which inbox)
    //    are configured in the ImprovMX dashboard, not here — these
    //    records only tell the internet "ImprovMX handles mail for this
    //    domain" and "ImprovMX is allowed to send mail claiming to be
    //    from this domain" (SPF, so forwarded mail doesn't get flagged
    //    as spoofed).
    // ---------------------------------------------------------------
    new Route53Record(this, "mx", {
      zoneId: zone.zoneId,
      name: domainName,
      type: "MX",
      ttl: 3600,
      records: ["10 mx1.improvmx.com", "20 mx2.improvmx.com"],
    });

    new Route53Record(this, "spf-txt", {
      zoneId: zone.zoneId,
      name: domainName,
      type: "TXT",
      ttl: 3600,
      records: ["v=spf1 include:spf.improvmx.com ~all"],
    });
  }
}
