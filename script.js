document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('mainSurvey');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    // Redirect after successful submit
    window.location.href = "thankyou.html";
  });
});
