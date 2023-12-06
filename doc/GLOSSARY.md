# Glossary

<dl>
<dt><strong>AddSignature</strong></dt>
<dd>A module that identifies events (TriggerEvent) coming from various sources and creates "signed events" (SignedTriggerEvent).</dd>
<dt><strong>Asynchronous collection</strong></dt>
<dd>A mechanism for collecting data in the background at scheduled intervals.</dd>
<dt><strong>CI/CD</strong></dt>
<dd>A continuous integration and delivery pipeline that automates the deployment process for the project.</dd>
<dt><strong>Code base</strong></dt>
<dd>The entire code and its history of revisions stored in a Git repository.</dd>
<dt><strong>CollectMetrics</strong></dt>
<dd>A module that collects metrics, normalizes and transforms the data into a standardized format (MetricData).</dd>
<dt><strong>Cron job</strong></dt>
<dd>A scheduled task that runs at specified times, allowing telemetry-functions to collect metrics asynchronously.</dd>
<dt><strong>Database</strong></dt>
<dd>A centralized location where telemetry-functions stores the collected metrics. Currently, telemetry-functions pushes it to a GitHub repo as a JSON file.</dd>
<dt><strong>Documentation</strong></dt>
<dd>Detailed instructions and comments that explain how to use and contribute to the project.</dd>
<dt><strong>Github OAuth app</strong></dt>
<dd>An app that allows telemetry-functions to collect metrics in real-time by listening to Github events.</dd>
<dt><strong>Handler</strong></dt>
<dd>A module that acts as a controller to define and handle the whole process, including error management and logging.</dd>
<dt><strong>HTTP endpoints</strong></dt>
<dd>URLs that a client uses to communicate with a server to perform certain actions or retrieve information.</dd>
<dt><strong>Hybrid paradigm</strong></dt>
<dd>A combination of event-driven and procedural paradigms used in telemetry-functions to capture real-time and asynchronous metrics from Github.</dd>
<dt><strong>Metric</strong></dt>
<dd>A specific data point or set of data points to be measured</dd>
<dt><strong>MetricData</strong></dt>
<dd>Data collected by telemetry-functions, which is normalized and transformed into a standardized format.</dd>
<dt><strong>Real-time event collection</strong></dt>
<dd>A mechanism for collecting data in real-time as soon as an event occurs.</dd>
<dt><strong>Serverless</strong></dt>
<dd>A cloud computing execution model where the cloud provider dynamically manages the allocation and provisioning of servers.</dd>
<dt><strong>Signature</strong></dt>
<dd>A classification added to an event object to determine the event type.</dd>
<dt><strong>Telemetry-functions</strong></dt>
<dd>A serverless function written in TypeScript that collects telemetry data from various sources and stores it in a centralized location for analysis and reporting.</dd>
<dt><strong>Unit tests</strong></dt>
<dd>Comprehensive tests that ensure that changes do not introduce regressions or errors.</dd>
<dt><strong>Unique IDs</strong></dt>
<dd>Unique identifiers assigned to all collected data to prevent duplication and ensure that the final database contains only necessary information.</dd>
</dl>
