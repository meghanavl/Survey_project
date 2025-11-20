
function hideAllSectionsButMoodHidden() {
  // hide the other sections/messages; don't auto-hide mood here because caller decides
  const idsToHide = ['amazingMessage','sectionAssignment','sectionAttendance','sectionMental','finalMessage'];
  idsToHide.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  // hide errors (only those that exist in your HTML)
  ['moodError','pendingError','rememberError','attendanceError','stableError','voiceError','horrorsError','userNameError','userSemesterError']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

  // remove is-invalid classes from inputs/selects (include only IDs present)
  ['pending','remember','attendance','stableLevel','userName','userSemester'].forEach(id => {
    const el = document.getElementById(id);
    if (el && el.classList) el.classList.remove('is-invalid');
  });

  // radios/checkbox visuals
  document.querySelectorAll('input[name="voice"]').forEach(i => i.classList && i.classList.remove('is-invalid'));
  document.querySelectorAll('input[name="semMood"]').forEach(i => i.classList && i.classList.remove('is-invalid'));
  // do NOT clear the user's checkbox selections here so they don't lose progress if they change mood
  // hideAllSectionsButMoodHidden should be a visual reset only
}

document.addEventListener('DOMContentLoaded', function () {
  console.log('script.js loaded');
  hideAllSectionsButMoodHidden();

  // Cache nodes (safely)
  const qMood = document.getElementById('qMood');
  const amazingMessage = document.getElementById('amazingMessage');
  const sectionAssignment = document.getElementById('sectionAssignment');
  const sectionAttendance = document.getElementById('sectionAttendance');
  const sectionMental = document.getElementById('sectionMental');

  // helper: collect assignment horrors (returns array) and populate hidden field
  function collectAssignmentHorrors() {
    const checked = Array.from(document.querySelectorAll('input[name="assignmentHorrors"]:checked'))
                         .map(cb => cb.value);
    const hv = document.getElementById('horrorsValue');
    if (hv) hv.value = checked.join(',');
    return checked;
  }

  // --- Mood branching: radio change should immediately branch ---
  const moodRadios = Array.from(document.querySelectorAll('input[name="semMood"]'));
  console.log('found mood radios:', moodRadios.length);
  if (moodRadios.length) {
    moodRadios.forEach(r => {
      r.addEventListener('change', function () {
        // clear previous mood error visuals
        const moodError = document.getElementById('moodError');
        if (moodError) moodError.style.display = 'none';
        moodRadios.forEach(i => i.classList && i.classList.remove('is-invalid'));

        // hide other panels visually
        hideAllSectionsButMoodHidden();

        if (this.value === 'amazing') {
          if (qMood) qMood.style.display = 'none';
          if (amazingMessage) amazingMessage.style.display = 'block';
        } else {
          if (qMood) qMood.style.display = 'none';
          if (sectionAssignment) sectionAssignment.style.display = 'block';
          // focus on first input for better UX
          const pendingEl = document.getElementById('pending');
          if (pendingEl) pendingEl.focus();
        }
      });
    });
  }

  // --- Assignment -> Attendance handler (includes checkbox and new field validation) ---
  const toAttendanceBtn = document.getElementById('toAttendance');
  console.log('toAttendanceBtn found:', !!toAttendanceBtn);
  if (toAttendanceBtn) {
    toAttendanceBtn.addEventListener('click', function (e) {
      e.preventDefault(); // prevents unintended form submit/reload
      console.log('toAttendance clicked');

      // fetch elements safely
      const pendingEl = document.getElementById('pending');
      const rememberEl = document.getElementById('remember');
      const pendingError = document.getElementById('pendingError');
      const rememberError = document.getElementById('rememberError');
      const horrorsError = document.getElementById('horrorsError');

      const nameEl = document.getElementById('userName');
      const nameError = document.getElementById('userNameError');
      const semEl = document.getElementById('userSemester');
      const semError = document.getElementById('userSemesterError');
      // NOTE: your HTML does not include a "userAdvice" textarea — so we won't validate it here.

      // reset visuals
      if (pendingEl) pendingEl.classList && pendingEl.classList.remove('is-invalid');
      if (pendingError) pendingError.style.display = 'none';
      if (rememberEl) rememberEl.classList && rememberEl.classList.remove('is-invalid');
      if (rememberError) rememberError.style.display = 'none';
      if (horrorsError) horrorsError.style.display = 'none';

      if (nameEl) { nameEl.classList && nameEl.classList.remove('is-invalid'); if (nameError) nameError.style.display = 'none'; }
      if (semEl)  { semEl.classList && semEl.classList.remove('is-invalid');  if (semError)  semError.style.display = 'none'; }

      let ok = true;
      const pendingVal = (pendingEl && pendingEl.value) ? pendingEl.value.trim() : '';

      // Validate pending: must be number 0-30 (matches your HTML min/max)
      if (pendingVal === '' || isNaN(pendingVal) || Number(pendingVal) < 0 || Number(pendingVal) > 30) {
        if (pendingEl) pendingEl.classList.add('is-invalid');
        if (pendingError) pendingError.style.display = 'block';
        ok = false;
      }

      // Validate remember selection
      const rememberVal = (rememberEl && rememberEl.value) ? rememberEl.value : '';
      if (!rememberVal) {
        if (rememberEl) rememberEl.classList.add('is-invalid');
        if (rememberError) rememberError.style.display = 'block';
        ok = false;
      }

      // Validate horrors: at least one checkbox must be selected
      const horrorsChecked = Array.from(document.querySelectorAll('input[name="assignmentHorrors"]:checked'));
      if (horrorsChecked.length === 0) {
        if (horrorsError) horrorsError.style.display = 'block';
        // if horrorsError element doesn't exist, we can flash the group briefly
        if (!horrorsError) {
          const g = document.getElementById('horrorsGroup');
          if (g) {
            g.classList.add('border','border-danger','rounded','p-2');
            setTimeout(() => g.classList.remove('border','border-danger','rounded','p-2'), 1400);
          }
        }
        ok = false;
      }

      // Validate name (non-empty)
      const nameVal = (nameEl && nameEl.value) ? nameEl.value.trim() : '';
      if (!nameVal) {
        if (nameEl) nameEl.classList.add('is-invalid');
        if (nameError) nameError.style.display = 'block';
        ok = false;
      }

      // Validate semester (non-empty)
      const semVal = (semEl && semEl.value) ? semEl.value.trim() : '';
      if (!semVal) {
        if (semEl) semEl.classList.add('is-invalid');
        if (semError) semError.style.display = 'block';
        ok = false;
      }

      if (!ok) {
        // optional: scroll to first visible error for better UX
        const firstErr = document.querySelector('.is-invalid, .text-danger[style*="display: block"]');
        if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // store horrors in hidden input
      const horrors = horrorsChecked.map(cb => cb.value);
      const hv = document.getElementById('horrorsValue');
      if (hv) hv.value = horrors.join(',');

      // Move on: hide assignment, show attendance
      if (sectionAssignment) sectionAssignment.style.display = 'none';
      if (sectionAttendance) sectionAttendance.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Attendance -> Mental ---
  const toMentalBtn = document.getElementById('toMental');
  console.log('toMentalBtn found:', !!toMentalBtn);
  if (toMentalBtn) {
    toMentalBtn.addEventListener('click', function (e) {
      e.preventDefault();
      console.log('toMental clicked');
      const attendanceEl = document.getElementById('attendance');
      const attendanceErr = document.getElementById('attendanceError');

      if (attendanceEl) attendanceEl.classList && attendanceEl.classList.remove('is-invalid');
      if (attendanceErr) attendanceErr.style.display = 'none';

      const attendanceVal = (attendanceEl && attendanceEl.value) ? attendanceEl.value : '';
      if (!attendanceVal) {
        if (attendanceEl) attendanceEl.classList.add('is-invalid');
        if (attendanceErr) attendanceErr.style.display = 'block';
        return;
      }

      if (sectionAttendance) sectionAttendance.style.display = 'none';
      if (sectionMental) sectionMental.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Final submit ---
  const submitBtn = document.getElementById('submitBtn');
  console.log('submitBtn found:', !!submitBtn);
  if (submitBtn) {
    submitBtn.addEventListener('click', function (e) {
      e.preventDefault();
      console.log('submitBtn clicked');

      const stableEl = document.getElementById('stableLevel');
      const stableErr = document.getElementById('stableError');
      const voiceErrorEl = document.getElementById('voiceError');

      if (stableEl) stableEl.classList && stableEl.classList.remove('is-invalid');
      if (stableErr) stableErr.style.display = 'none';
      if (voiceErrorEl) voiceErrorEl.style.display = 'none';
      document.querySelectorAll('input[name="voice"]').forEach(i => i.classList && i.classList.remove('is-invalid'));

      let ok = true;
      if (!stableEl || !stableEl.value) {
        if (stableEl) stableEl.classList.add('is-invalid');
        if (stableErr) stableErr.style.display = 'block';
        ok = false;
      }

      const voiceChecked = document.querySelector('input[name="voice"]:checked');
      if (!voiceChecked) {
        document.querySelectorAll('input[name="voice"]').forEach(i => i.classList && i.classList.add('is-invalid'));
        if (voiceErrorEl) voiceErrorEl.style.display = 'block';
        ok = false;
      }

      if (!ok) return;

      // collect payload (include new fields)
      const mood = (document.querySelector('input[name="semMood"]:checked') || {}).value || null;
      const pending = (document.getElementById('pending') && document.getElementById('pending').value) ? document.getElementById('pending').value.trim() : '';
      const remember = (document.getElementById('remember') && document.getElementById('remember').value) ? document.getElementById('remember').value : '';
      const attendance = (document.getElementById('attendance') && document.getElementById('attendance').value) ? document.getElementById('attendance').value : '';
      const stable = stableEl.value;
      const voiceVal = voiceChecked.value;

      const horrors = collectAssignmentHorrors(); // array
      const userName = (document.getElementById('userName') && document.getElementById('userName').value) ? document.getElementById('userName').value.trim() : '';
      const userSemester = (document.getElementById('userSemester') && document.getElementById('userSemester').value) ? document.getElementById('userSemester').value.trim() : '';

      const payload = { mood, pending, remember, attendance, stable, voice: voiceVal, horrors, userName, userSemester };
      console.log('Prepared payload (client-side):', payload);

      // sanity check
      if (pending !== '' && Number(pending) > 40) {
        if (!confirm('You have a LOT of pending assignments. Still submit?')) return;
      }

      // disable and show feedback
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
      const finalMessage = document.getElementById('finalMessage');
      if (finalMessage) finalMessage.style.display = 'block';

      setTimeout(() => {
        window.location.href = 'thankyou.html';
      }, 700);
    });
  }
});
