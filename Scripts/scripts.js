document.addEventListener('DOMContentLoaded', function() {
    var today = new Date().toISOString().split('T')[0];
    document.getElementById('fecha-ingreso').setAttribute('max', today);
    document.getElementById('fecha-ingreso').value = today;

    if (document.getElementById('registrationForm')) {
        var form = document.getElementById('registrationForm');
        form.addEventListener('submit', function(event) {
            if (form.checkValidity() === false) {
                event.preventDefault();
                event.stopPropagation();
            } else {
                event.preventDefault();
                addUser();
            }
            form.classList.add('was-validated');
        }, false);
    }

    if (document.getElementById('user-list')) {
        loadUsers();
        initSortable();
    }
});

function addUser() {
    let nombre = document.getElementById('nombre').value;
    let apellido = document.getElementById('apellido').value;
    let fechaNacimiento = document.getElementById('fecha-nacimiento').value;
    let email = document.getElementById('email').value;
    let cargo = document.getElementById('cargo').value;
    let fechaIngreso = document.getElementById('fecha-ingreso').value;

    let users = JSON.parse(localStorage.getItem('users')) || [];

    if (users.some(user => user.email === email)) {
        alert('El correo ya está registrado.');
        return;
    }

    let birthDate = new Date(fechaNacimiento);
    let ingressDate = new Date(fechaIngreso);
    let today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    let monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    if (age < 18 || age > 85) {
        alert('La edad del trabajador debe estar entre 18 y 85 años.');
        return;
    }

    let employmentAge = ingressDate.getFullYear() - birthDate.getFullYear();
    let employmentMonthDifference = ingressDate.getMonth() - birthDate.getMonth();
    if (employmentMonthDifference < 0 || (employmentMonthDifference === 0 && ingressDate.getDate() < birthDate.getDate())) {
        employmentAge--;
    }
    if (employmentAge < 18) {
        alert('El trabajador no puede ingresar antes de los 18 años.');
        return;
    }

    if (confirm(`¿Desea agregar el siguiente usuario?\nNombre: ${nombre} ${apellido}\nEmail: ${email}\nCargo: ${cargo}\nFecha de Ingreso: ${fechaIngreso}`)) {
        users.push({ nombre, apellido, fechaNacimiento, email, cargo, fechaIngreso });
        localStorage.setItem('users', JSON.stringify(users));
        alert('Usuario agregado exitosamente.');
        resetForm();
        loadUsers();
    }
}

function resetForm() {
    var form = document.getElementById('registrationForm');
    form.reset();
    form.classList.remove('was-validated');
    Array.from(form.elements).forEach(element => {
        element.classList.remove('is-valid', 'is-invalid');
    });
    var today = new Date().toISOString().split('T')[0];
    document.getElementById('fecha-ingreso').setAttribute('max', today);
    document.getElementById('fecha-ingreso').value = today;
}

function loadUsers() {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let userList = document.getElementById('user-list');
    userList.innerHTML = '';

    users.forEach((user, index) => {
        let userCard = document.createElement('div');
        userCard.className = 'col-md-2.5 user-card mb-3';
        userCard.setAttribute('data-id', index);
        userCard.setAttribute('draggable', true);
        userCard.setAttribute('ondragstart', 'drag(event)');
        userCard.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${user.nombre} ${user.apellido}</h5>
                    <p class="card-text">${user.email}</p>
                    <p class="card-text">${user.cargo}</p>
                    <p class="card-text">${user.fechaIngreso}</p>
                    <button class="btn btn-danger btn-sm" onclick="confirmRemoveUser(${index})">Eliminar</button>
                </div>
            </div>
        `;
        userList.appendChild(userCard);
    });
    initSortable();
}

function confirmRemoveUser(index) {
    if (confirm('¿Está seguro de que desea eliminar este usuario?')) {
        if (confirm('¿Realmente está seguro? Esta acción no se puede deshacer.')) {
            removeUser(index);
        }
    }
}

function removeUser(index) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users.splice(index, 1);
    localStorage.setItem('users', JSON.stringify(users));
    loadUsers();
}

function initSortable() {
    let userList = document.getElementById('user-list');
    Sortable.create(userList, {
        animation: 150,
        onEnd: function (evt) {
            let users = JSON.parse(localStorage.getItem('users')) || [];
            const movedItem = users.splice(evt.oldIndex, 1)[0];
            users.splice(evt.newIndex, 0, movedItem);
            localStorage.setItem('users', JSON.stringify(users));
            loadUsers();
        }
    });
}
