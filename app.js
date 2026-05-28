function formToDataset(form) {
  const fd = new FormData(form);
  const phenomena = fd.getAll("phenomena");
  const zone = fd.get("zone_name") || "AW_ZONE";
  const now = new Date().toISOString();
  const caseId = "AW-" + String(zone).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10) + "-" + now.replace(/[-:.TZ]/g, "").slice(0, 12);

  let confidence = 1;
  if (["gps", "map_pin"].includes(fd.get("location_mode"))) confidence += 1;
  if (fd.get("photo_video") === "yes") confidence += 1;
  if (["Lifeguard", "Municipal staff", "O2P coordinator", "UAV operator", "Researcher / observer"].includes(fd.get("reporter_role"))) confidence += 1;
  if (phenomena.length >= 2) confidence += 1;
  confidence = Math.min(confidence, 5);

  const highSignals = ["Drift toward bathing zone", "Skin / respiratory symptoms", "Foam / mucilage", "Floating algae mat"];
  const hits = phenomena.filter(x => highSignals.includes(x)).length;
  let urgency = "Low";
  if (fd.get("mat_movement") === "toward_bathing_zone" || hits >= 3) urgency = "Critical";
  else if (hits >= 2 || fd.get("mat_density") === "high") urgency = "High";
  else if (hits === 1 || fd.get("mat_density") === "medium") urgency = "Elevated";

  return {
    case_id: caseId,
    case_type: "ALGAE_WATCH_SAFETY_REPORT",
    dataset_version: "Algae Watch HE2I v1.0beta",
    created_utc: now,
    zone_name: fd.get("zone_name") || null,
    source_type: "human_bio_informational_sensor",
    reporter_role: fd.get("reporter_role") || null,
    contact_for_follow_up: fd.get("contact") || null,
    observation_time_local: fd.get("observation_time") || null,
    location_mode: fd.get("location_mode") || null,
    location_details: fd.get("location_details") || null,
    observed_phenomena: phenomena,
    water_colour: fd.get("water_colour") || null,
    odour: fd.get("odour") || null,
    symptoms_context: fd.get("symptoms") || null,
    marine_mat_observed: fd.get("marine_mat_observed") === "yes",
    mat_size: fd.get("mat_size") || null,
    mat_density_class: fd.get("mat_density") || null,
    mat_movement_class: fd.get("mat_movement") || null,
    wind_direction: fd.get("wind_direction") || null,
    wind_speed: fd.get("wind_speed") || null,
    current_direction: fd.get("current_direction") || null,
    evidence_photo_video_available: fd.get("photo_video") === "yes",
    narrative: fd.get("narrative") || null,
    confidence_score: confidence,
    urgency_class: urgency,
    downstream_route: ["Critical", "High"].includes(urgency) ? "P-BBFC_NEXUS_UI3A_TRIAGE" : "ALGAE_WATCH_MONITORING_QUEUE"
  };
}

function renderPreview() {
  const form = document.getElementById("reportForm");
  const dataset = formToDataset(form);
  document.getElementById("datasetPreview").textContent = JSON.stringify(dataset, null, 2);
  return dataset;
}

document.getElementById("previewBtn").addEventListener("click", renderPreview);
document.getElementById("reportForm").addEventListener("input", renderPreview);

document.getElementById("reportForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = document.getElementById("status");
  const dataset = renderPreview();
  status.className = "status";
  status.textContent = "Submitting report...";
  try {
    const response = await fetch("/api/submit-report", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(dataset)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Submission failed");
    status.className = "status ok";
    status.textContent = "Report submitted. Telegram notification channel accepted the case.";
  } catch (error) {
    status.className = "status err";
    status.textContent = "Submission failed: " + error.message;
  }
});

renderPreview();
