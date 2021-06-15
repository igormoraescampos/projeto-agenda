
(function () {

    const endpoint = 'http://localhost:7000/contacts';



    // User Interface (UI)
    const ui = {
        fields: document.querySelectorAll("input"),
        buttonAdd: document.querySelector(".btn-add"),
        buttonEdit: document.querySelector(".btn-edit"),
        contactList: document.querySelector(".pure-table tbody"),
        formTitle: document.querySelector(".pure-form legend")
      };



    // Actions
    const validateFields = function (e) {
        
        e.preventDefault();

        // console.log(ui.fields);
        let errors = 0;
        let data = {};

        ui.fields.forEach(function (field) {

        if (field.value.trim() !== "") {
            field.classList.remove("error");
            data[field.id] = field.value; 
        } else{
            field.classList.add("error");
            errors++;
        }

        });

        if (errors === 0) {
            addContact(data)
        } else {
            document.querySelector(".error").focus();
        };

    // console.log("errors", errors);
    // console.log("data", data);

    };



    const addContact = function (contact) {
        
        // console.log(contact);

        const config = {
            method: 'post',
            body: JSON.stringify(contact),
            headers: new Headers({ 
                'Content-type': 'application/json'
            })
        };

        fetch(endpoint, config)
            .then(addContactSuccess)
            .catch(addContactError)
            // .finally()
    
    };



    const showMessage = function (msg, action) {
        ui.formTitle.textContent = msg;
        ui.formTitle.classList[action]('error');
    };


    
    const addContactSuccess = function () {
        showMessage('Agenda', 'remove');
        clearFields();
        getContacts();
    };



    const addContactError = function () {
        showMessage('Ocorreu um erro!', 'add');
    };



    const getContacts = function () {

        const config = {
            method: 'GET',
            headers: new Headers({ 
                'Content-type': 'application/json'
            })
        };

        console.log(
            fetch(`${endpoint}?_sort=id&_order=desc`, config)
                .then(getContactsSuccess)
                    .then(getDataSuccess)
                    .catch(getDataError)
                .catch(getContactsError)
        );

    };



    const getContactsSuccess = function (response) {
        showMessage('Agenda', 'remove');
        return response.json();

    };



    const getContactsError = function () {
        showMessage('Ocorreu um erro ao recuperar as mensagens', 'add');
    };



    const getDataSuccess = function (contacts) {
        // console.table(contacts);

        let htmlTable = contacts.map(function (contact) {
            // console.log(contact);

            return `<tr>
                        <td>${contact.id}</td>
                        <td>${contact.name}</td>
                        <td>${contact.phone}</td>
                        <td>${contact.email}</td>
                        <td>
                        <a href="#" data-id="${contact.id}" data-action="edit">Editar</a> |
                        <a href="#" data-id="${contact.id}" data-action="remove">Excluir</a>
                    </td>
                </tr>`;
            // console.log(lineTable);
        }).join('');

        if (contacts.length === 0) {
            htmlTable = `<tr>
                            <td colspan="5">Não existem dados registrados!</td>
                        </tr>`
        };

        // console.log(htmlTable);

        ui.contactList.innerHTML = htmlTable;
    };



    const getDataError = function (response) {
        showMessage('Ocorreu um erro ao recuperar as mensagens', 'add');
    };



    const clearFields = function () {
        ui.fields.forEach(function (field) {
            field.value = '';
        });

        document.querySelector('input').focus();
    };



    const handlerAction  = function (e) {
        
        e.preventDefault();

        const { action, id } = e.target.dataset;

        console.log(action);
        // console.log(e.target.dataset);

        if (action === 'edit') {
            editContact(id);
        }

        if (action === 'remove' && confirm('TEM CERTEZA QUE DESEJA EXCLUIR O ITEM?')) {
            removeContact(id);
        }
    };



    const removeContact = function (id) {
        // console.log('removing...');

        const config = {
            method: 'DELETE',
            headers: new Headers({ 
                'Content-type': 'application/json'
            })
        };

        fetch(`${endpoint}/${id}`, config)
            .then(getContacts)
            .catch(removeContactError)

    };



    const removeContactError = function () {
        showMessage('Ocorreu um erro ao recuperar as mensagens', 'add');
    };



    const editContact = function (id) {
        
        console.log('editing...');

        const config = {
            method: 'GET',
            headers: new Headers({ 
                'Content-type': 'application/json'
            })
        };

        fetch(`${endpoint}/${id}`, config)
            .then(function(response) { return response.json(); })
                .then(fillFields)
                .catch(editContactError)
            .catch(editContactError);
    };



    const editContactError = function () {
        showMessage('Ocorreu um erro ao recuperar as mensagens', 'add');
    };



    const fillFields = function(data) {

        console.log(data);

        ui.fields.forEach(function(field) {
            console.log(field);
            field.value = data[field.id]
        })

        ui.buttonEdit.dataset.id = data.id;

        document.querySelector('input').focus();

        toggleButtons();

    };



    const toggleButtons = function () {
        ui.buttonEdit.classList.toggle('hide');
        ui.buttonAdd.classList.toggle('hide');
    };



    const updateContact = function (e) {

        const { id } = e.target.dataset;
        
        let dataUpdated = {}
        
        ui.fields.forEach(function(field) {
            dataUpdated[field.id] = field.value;
        })

        const config = {
            method: 'PUT',
            body: JSON.stringify(dataUpdated),
            headers: new Headers({ 
                'Content-type': 'application/json'
            })
        };

        fetch(`${endpoint}/${id}`, config)
            .then(function(response) { return response.json(); })
                .then(getContacts)
                .catch(editContactError);

        console.log(dataUpdated);
    };



    const restoreScreen = function () {
        getContacts();
        toggleButtons();
        clearFields();
    };



    // Bindings on Events
    ui.buttonAdd.onclick = validateFields;  // validateFields (MouseEvent);
    ui.contactList.onclick = handlerAction;  // handlerAction (MouseEvent);
    ui.buttonEdit.onclick = updateContact;

    //Initialize
    getContacts();

})()