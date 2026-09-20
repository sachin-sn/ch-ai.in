import { Construct } from "constructs";
import { App, TerraformStack, TerraformOutput, GcsBackend } from "cdktf";

import { GoogleProvider } from "./.gen/providers/google/provider";
import { ProjectService } from "./.gen/providers/google/project-service";
import { DnsManagedZone } from "./.gen/providers/google/dns-managed-zone";
import { DnsRecordSet } from "./.gen/providers/google/dns-record-set";
import { GoogleBetaProvider } from "./.gen/providers/google-beta/provider";
import { GoogleFirebaseProject } from "./.gen/providers/google-beta/google-firebase-project";

/**
 * infra-gcp
 * =========
 * The GCP counterpart to `infra/` (AWS). Deliberately small for Phase 1:
 * it enables the Firebase APIs and links Firebase to the GCP project.
 *
 * It does NOT create the Firebase Hosting site or attach the custom domain.
 * Both `google_firebase_hosting_site` and `google_firebase_hosting_custom_domain`
 * are beta Terraform resources with known reliability issues (see README.md
 * "Why the Hosting site isn't in Terraform"). Those two steps are a five-
 * minute one-time manual action via the Firebase CLI/console instead -
 * same spirit as leaving the resume PDF upload as a manual step on the AWS
 * side rather than fighting a flaky automation path for a one-time action.
 *
 * State: GCS backend, in the bucket infra-gcp-bootstrap created.
 * Deploy: hand-run the first time (`npx cdktf deploy`); CI's job (see the
 * GitHub Actions workflow) is pushing site *content*, not infra changes.
 */

const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID ?? "my-project-1530065360314";
const GCP_REGION = process.env.GCP_REGION ?? "asia-south1";
const DOMAIN_NAME = "ch-ai.in";

class GcpStaticSiteStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new GcsBackend(this, {
      bucket: `${GCP_PROJECT_ID}-tfstate`,
      prefix: "infra-gcp",
    });

    new GoogleProvider(this, "google", {
      project: GCP_PROJECT_ID,
      region: GCP_REGION,
    });

    // Needed only for the beta-only FirebaseProject resource below. Kept
    // as its own const (not just `new ...;`) so it can be bound explicitly
    // to that resource - cdktf/Terraform won't infer which provider config
    // to use just because a resource type happens to exist in both the
    // "google" and "google-beta" provider schemas.
    const googleBeta = new GoogleBetaProvider(this, "google-beta", {
      project: GCP_PROJECT_ID,
      region: GCP_REGION,
    });

    const requiredApis = [
      "firebase.googleapis.com",
      "firebasehosting.googleapis.com",
    ];
    const enabledApis = requiredApis.map(
      (service) =>
        new ProjectService(this, `api-${service.split(".")[0]}`, {
          project: GCP_PROJECT_ID,
          service,
          disableOnDestroy: false,
        }),
    );

    // google_firebase_project is google-beta-only (unlike the plain
    // ProjectService API-enablement above) - Firebase project linkage
    // hasn't been promoted to the GA google provider. Hosting site/domain
    // resources are ALSO beta and still left as a manual step (see above).
    const firebaseProject = new GoogleFirebaseProject(this, "firebase", {
      project: GCP_PROJECT_ID,
      dependsOn: enabledApis,
      provider: googleBeta,
    });

    new TerraformOutput(this, "firebase_project_id", {
      value: firebaseProject.project,
    });
    new TerraformOutput(this, "next_manual_step", {
      value:
        "Run `firebase login` then `firebase hosting:sites:create <site-id>` and add the custom domain via `firebase hosting:channel:deploy` or the console - see README.md.",
    });

    // ---------------------------------------------------------------
    // DNS: Cloud DNS replaces AWS Route53 as the authoritative DNS for
    // ch-ai.in (migrating off Route53 to drop its $0.50/mo zone fee -
    // Cloud DNS is ~$0.20/mo + trivial per-query cost, no free tier,
    // but comfortably covered by GCP signup credit for now).
    //
    // MX/SPF are recreated here so ImprovMX email keeps working through
    // the cutover. NOT yet included: the Firebase Hosting verification
    // TXT record and the final A/AAAA records Firebase's "Add custom
    // domain" flow gives you - those values don't exist until you've
    // run `firebase hosting:sites:create` and started that flow in the
    // console (see next_manual_step above). Add them as additional
    // DnsRecordSet resources once you have them, then redeploy.
    //
    // Nothing resolves through this zone until its nameServers (see the
    // output below) are set at the domain registrar in place of
    // Route53's. Don't touch the registrar until those records are
    // added and this has been deployed at least once.
    // ---------------------------------------------------------------
    const dnsApi = new ProjectService(this, "api-dns", {
      project: GCP_PROJECT_ID,
      service: "dns.googleapis.com",
      disableOnDestroy: false,
    });

    const zone = new DnsManagedZone(this, "zone", {
      name: "ch-ai-in",
      dnsName: `${DOMAIN_NAME}.`,
      description: "ch-ai.in - migrated from AWS Route53",
      dependsOn: [dnsApi],
    });

    new DnsRecordSet(this, "mx", {
      managedZone: zone.name,
      name: zone.dnsName,
      type: "MX",
      ttl: 3600,
      rrdatas: ["10 mx1.improvmx.com.", "20 mx2.improvmx.com."],
    });

    // A single name+type can only have ONE record set in DNS - the SPF
    // TXT and Firebase's ownership-verification TXT both live at the
    // apex, so they have to be rrdatas on the SAME DnsRecordSet, not two
    // separate resources (Cloud DNS would reject the second as a
    // duplicate/conflicting record set for ch-ai.in TXT).
    new DnsRecordSet(this, "apex-txt", {
      managedZone: zone.name,
      name: zone.dnsName,
      type: "TXT",
      ttl: 3600,
      rrdatas: [
        '"v=spf1 include:spf.improvmx.com ~all"',
        '"hosting-site=ch-ai-portfolio"', // Firebase custom-domain ownership verification
      ],
    });

    // Firebase's ownership-verification A record. This may get replaced
    // by different/additional A (and possibly AAAA) records once the
    // Firebase console confirms verification and shows the final
    // serving records - update this resource then, don't just add a
    // second "A" DnsRecordSet (same one-record-set-per-name+type rule
    // as the TXT record above).
    new DnsRecordSet(this, "apex-a", {
      managedZone: zone.name,
      name: zone.dnsName,
      type: "A",
      ttl: 300,
      rrdatas: ["199.36.158.100"],
    });

    new TerraformOutput(this, "dns_zone_name_servers", {
      value: zone.nameServers,
      description:
        "Copy these into your domain registrar's nameserver settings for ch-ai.in - this is what actually cuts DNS over from Route53.",
    });
  }
}

const app = new App();
new GcpStaticSiteStack(app, "infra-gcp");
app.synth();
