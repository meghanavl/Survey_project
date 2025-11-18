// Updated script: hides the mood block when progressing and adds inline validation
function hideAllSectionsButMoodHidden() {
  // hide the other sections/messages; don't auto-hide mood here because caller decides
  document.getElementById('amazingMessage').style.display = 'none';
  document.getElementById('sectionAssignment').style.display = 'none';
  document.getElementById('sectionAttendance').style.display = 'none';
  document.getElementById('sectionMental').style.display = 'none';
  document.getElementById('finalMessage').style.display = 'none';

  // hide errors
  ['moodError','pendingError','rememberError','attendanceError','stableError','voiceError'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  // remove is-invalid classes
  ['pending','remember','attendance','stableLevel'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('is-invalid');
  });
  document.querySelectorAll('input[name="voice"]').forEach(i => i.classList.remove('is-invalid'));
  document.querySelectorAll('input[name="semMood"]').forEach(i => i.classList.remove('is-invalid'));
}

document.addEventListener('DOMContentLoaded', function () {
  hideAllSectionsButMoodHidden();

  // Cache nodes
  const qMood = document.getElementById('qMood');
  const amazingMessage = document.getElementById('amazingMessage');
  const sectionAssignment = document.getElementById('sectionAssignment');
  const sectionAttendance = document.getElementById('sectionAttendance');
  const sectionMental = document.getElementById('sectionMental');

  // When the mood radio changes -> immediate branch
  document.querySelectorAll('input[name="semMood"]').forEach(r => {
    r.addEventListener('change', function () {
      // clear previous errors
      document.getElementById('moodError').style.display = 'none';
      document.querySelectorAll('input[name="semMood"]').forEach(i => i.classList.remove('is-invalid'));

      // hide everything else
      hideAllSectionsButMoodHidden();

      if (this.value === 'amazing') {
        // hide mood block, show early exit
        qMood.style.display = 'none';
        amazingMessage.style.display = 'block';
      } else {
        // hide mood block and show assignment directly
        qMood.style.display = 'none';
        sectionAssignment.style.display = 'block';
      }
    });
  });

  // If user clicks to go back to mood (optional UX) — allow clicking mood label? Not needed.
  // Assignment -> Attendance
  document.getElementById('toAttendance').addEventListener('click', function () {
    // validate pending
    const pendingEl = document.getElementById('pending');
    const pendingVal = pendingEl.value.trim();

    // reset visuals
    pendingEl.classList.remove('is-invalid');
    document.getElementById('pendingError').style.display = 'none';
    document.getElementById('rememberError').style.display = 'none';
    document.getElementById('remember').classList.remove('is-invalid');

    let ok = true;
    if (pendingVal === '' || isNaN(pendingVal) || Number(pendingVal) < 0 || Number(pendingVal) > 50) {
      pendingEl.classList.add('is-invalid');
      document.getElementById('pendingError').style.display = 'block';
      ok = false;
    }

    // validate remember
    const rememberVal = document.getElementById('remember').value;
    if (!rememberVal) {
      document.getElementById('remember').classList.add('is-invalid');
      document.getElementById('rememberError').style.display = 'block';
      ok = false;
    }

    if (!ok) return;

    // Move on: hide assignment, show attendance
    sectionAssignment.style.display = 'none';
    sectionAttendance.style.display = 'block';
  });

  // Attendance -> Mental
  document.getElementById('toMental').addEventListener('click', function () {
    // reset visuals
    const attendanceEl = document.getElementById('attendance');
    attendanceEl.classList.remove('is-invalid');
    document.getElementById('attendanceError').style.display = 'none';

    const attendanceVal = attendanceEl.value;
    if (!attendanceVal) {
      attendanceEl.classList.add('is-invalid');
      document.getElementById('attendanceError').style.display = 'block';
      return;
    }

    // Move on
    sectionAttendance.style.display = 'none';
    sectionMental.style.display = 'block';
  });

  // Final submit
  document.getElementById('submitBtn').addEventListener('click', function () {
    // reset visuals
    const stableEl = document.getElementById('stableLevel');
    stableEl.classList.remove('is-invalid');
    document.getElementById('stableError').style.display = 'none';

    document.getElementById('voiceError').style.display = 'none';
    document.querySelectorAll('input[name="voice"]').forEach(i => i.classList.remove('is-invalid'));

    let ok = true;
    if (!stableEl.value) {
      stableEl.classList.add('is-invalid');
      document.getElementById('stableError').style.display = 'block';
      ok = false;
    }

    const voiceChecked = document.querySelector('input[name="voice"]:checked');
    if (!voiceChecked) {
      // mark radios
      document.querySelectorAll('input[name="voice"]').forEach(i => i.classList.add('is-invalid'));
      document.getElementById('voiceError').style.display = 'block';
      ok = false;
    }

    if (!ok) return;

    // Collect payload (client-side example)
    const mood = (document.querySelector('input[name="semMood"]:checked') || {}).value || null;
     const pending = (document.getElementById('pending') && document.getElementById('pending').value) ? document.getElementById('pending').value.trim() : '';
  const remember = (document.getElementById('remember') && document.getElementById('remember').value) ? document.getElementById('remember').value : '';
  const attendance = (document.getElementById('attendance') && document.getElementById('attendance').value) ? document.getElementById('attendance').value : '';
    const stable = stableEl.value;
    const voiceVal = voiceChecked.value;

    const payload = { mood, pending, remember, attendance, stable, voice: voiceVal };
    console.log('Prepared payload (client-side):', payload);

    // sanity check (example)
    if (pending !== '' && Number(pending) > 40) {
      if (!confirm('You have a LOT of pending assignments. Still submit?')) return;
    }

   
  // Disable submit to prevent double-clicks and show immediate feedback
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  // Show on-page final message briefly (optional reassurance)
  document.getElementById('finalMessage').style.display = 'block';

  // Redirect to thankyou.html after a short delay
  setTimeout(() => {
    window.location.href = 'thankyou.html';
  }, 700);
  
  });

  // If user manually refreshes and wants to start over, you can provide a "Restart" later.
});
