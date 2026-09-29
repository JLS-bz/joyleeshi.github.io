---
layout: page
title: Parent/Guardian Permission
permalink: /parent-guardian-permission/
---

<link rel="stylesheet" href="{{ '/assets/css/student-mental-health-survey.css' | relative_url }}">

<div id="mh-parent-permission-app" class="survey-shell">
  <div id="parent-permission-status" class="survey-status" aria-live="polite"></div>
</div>

<script>
  window.MH_PARENT_PERMISSION_CONFIG = {
    backendUrl: "https://script.google.com/macros/s/AKfycbyZhyr22blhlFPBODMvJo8etKpcXy2cUOnXoNMGpNEPVwo6ApYqM__b9qsKjCnlv9Z_/exec"
  };
</script>

<script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js"></script>
<script src="{{ '/assets/js/parent-guardian-permission.js' | relative_url }}"></script>
