// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
    'use strict'

    const forms = document.querySelectorAll('.validated-form')
    //this is the class we put on the form itself

    // Loop over them and prevent submission
    Array.from(forms) //make an array from forms
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }

                form.classList.add('was-validated')
            }, false)
        })
})()