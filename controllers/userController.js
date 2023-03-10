class UserController {
    // Método constructor, que possuem os principais atributos e métodos de inicialização
    constructor(formIdCreate, formIdUpdate, tableId){
        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate)
        this.tableEl = document.getElementById(tableId);

        this.onSubmit();
        this.onEdit();
        this.selectAll();
    }

    /* Método acionado quando o formulário de EDIÇÃO é enviado.
    Aqui, atualizamos as informações e as colocamos na <tr> e no localStorage, utilizando
    os métodos destinados para isso.*/
    onEdit(){
        document.querySelector("#box-user-update .btn-cancel").addEventListener('click', e => {
            this.showPanelCreate();
        })

        this.formUpdateEl.addEventListener('submit', e => {
            e.preventDefault();

            let btn = this.formUpdateEl.querySelector("[type=submit]")

            btn.disabled = true

            let values = this.getValues(this.formUpdateEl);

            let index = this.formUpdateEl.dataset.trIndex

            let tr = this.tableEl.rows[index]

            let userOld = JSON.parse(tr.dataset.user)

            let result = Object.assign({}, userOld, values)

            this.getPhoto(this.formUpdateEl).then((content) => {

                if (!values.photo){
                    result._photo = userOld._photo
                } else {
                    result._photo = content
                }

                let user = new User()
                
                user.loadFromJSON(result)

                user.save()

                this.getTr(user, tr)

                this.updateCount();

                this.formUpdateEl.reset()

                btn.disabled = false

                this.showPanelCreate()
            }, 
                (e) => {
                console.error(e)
            })
        })
    }

    /* Método acionado quando o formulário de CADASTRO é enviado.
    Aqui, obtemos as informações e as colocamos na <tr> e no localStorage, utilizando os
    métodos destinados para isso.*/
    onSubmit(){
        this.formEl.addEventListener("submit", e => {

            e.preventDefault();

            let btn = this.formEl.querySelector("[type=submit]")

            btn.disabled = true

            let values = this.getValues(this.formEl);

            if (!values) return false

            console.log(values)

            this.getPhoto(this.formEl).then((content) => {
                values.photo = content
                values.save()
                this.addLine(values)
                this.formEl.reset()
                btn.disabled = false
            }, 
                (e) => {
                console.error(e)
            })
        })
    }

    /* Método de leitura de arquivos. Este é responsável por ler o arquivo enviado
    (nesse caso, uma foto) e interpretá-lo, para que depois possamos colocá-lo na tabela
    dos usuários. */
    getPhoto(formEl){
        return new Promise(function(resolve, reject){
            let fileReader = new FileReader();
    
            let formElArray = [...formEl.elements]
            
            let elements = formElArray.filter((item) => {
               if (item.name == 'photo') {
                    return item
                }
            });
    
            let file = elements[0].files[0]
    
            fileReader.onload = () => {
                resolve(fileReader.result);
            }

            fileReader.onerror = (e) => {
                reject(e)
            }

            if (file){
                fileReader.readAsDataURL(file)
            } else {
                resolve('./dist/img/avatar.png');
            }
        });
    }
    
    /* Método que obtém os campos do formulário com seus valores digitados pelo usuário 
    e transforma isso em um objeto, como um novo usuário. */
    getValues(formEl){

        let user = {}

        let isValid = true;

        let formElArray = [...formEl.elements]
        
        formElArray.forEach(function(input, index) {
            if(['name', 'email', 'password'].indexOf(input.name) > -1 && !input.value){
                input.parentElement.classList.add("has-error");
                isValid = false
            }

            if(input.name == "gender"){
                if (input.checked){
                    user[input.name] = [input.value]
                }    
            } else if (input.name == "admin"){
                user[input.name] = input.checked
            } else {
                user[input.name] = input.value
            }
        });
        
        if (!isValid){
            return false
        }

        return new User(user.name, user.gender, user.birth, user.country, user.email, user.password, user.photo, user.admin)
    }


    selectAll(){
        let users = User.getUsersStorage()

        users.forEach(dataUser => {

            let user =  new User();

            user.loadFromJSON(dataUser);

            this.addLine(user);

        })
    }

    // Método responsável por adicionar a linha com os dados do usuário na tabela no HTML.
    addLine(datauser){
        let tr = this.getTr(datauser)

        this.tableEl.appendChild(tr)

        this.updateCount();
    }

    // Método que cria uma tag <tr> e coloca os dados do usuário dentro dela.
    getTr(datauser, tr = null){
        if (tr === null) tr = document.createElement("tr")

        tr.dataset.user = JSON.stringify(datauser)

        tr.innerHTML = `
            <td><img src="${datauser.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${datauser.name}</td>
            <td>${datauser.email}</td>
            <td>${(datauser.admin) ? 'Sim' : 'Não'}</td>
            <td>${(Utils.dateFormat(datauser.register))}</td>
            <td>
                <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
            </td>`
            
        this.addEventsTr(tr);

        return tr
    }

    /* Método que permite escutar o evento de click nos botões Editar e Excluir, e assim, tratar
    dessas duas ações. */
    addEventsTr(tr){
        tr.querySelector(".btn-delete").addEventListener('click', e => {

            if(confirm("Deseja realmente excluir?")){

                let user = new User();

                user.loadFromJSON(JSON.parse(tr.dataset.user))

                user.remove();

                tr.remove();

                this.updateCount();

            }
        })

        tr.querySelector(".btn-edit").addEventListener('click', e => {`
        `
            let json = JSON.parse(tr.dataset.user)

            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex

            for (let name in json){

                let field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "]")

                if (field){
                    
                    switch(field.type){
                        case "file":
                        continue;
                        break;

                        case "radio":
                            field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "][value=" + json[name] + "]")
                            field.checked = true;
                        break;

                        case "checkbox":
                            field.checked = json[name];
                        break;

                        default:
                            field.value = json[name];
                    } 
                }
            }

            this.formUpdateEl.querySelector(".photo").src = json._photo; 

            this.showPanelUpdate();
        })
    }

    // Método que oculta o formulário de EDIÇÃO e mostra o formulário de CADASTRO.
    showPanelCreate(){
        document.querySelector("#box-user-create").style.display = 'block'
        document.querySelector("#box-user-update").style.display = 'none'
    }

    // Método que oculta o formulário de CADASTRO e mostra o formulário de EDIÇÃO.
    showPanelUpdate(){
        document.querySelector("#box-user-create").style.display = 'none'
        document.querySelector("#box-user-update").style.display = 'block'
    }

    /* Método que contabiliza quantos usuários foram criados na plataforma, com base no número
    de tags <tr> que existem na tabela. Além disso, esse método também verifica quantos usuários
    são administradores, com base no número de usuário que marcaram a checkbox "Admin". */
    updateCount(){
        let numberUsers = 0;
        let numberAdmin = 0;

        let tableElChildren = [...this.tableEl.children]

        tableElChildren.forEach((tr) => {
            numberUsers++

            let user = JSON.parse(tr.dataset.user)

            if (user._admin){
                numberAdmin++
            }
        })

        document.querySelector("#number-users").innerHTML = numberUsers;
        document.querySelector("#number-users-admin").innerHTML = numberAdmin
    }
}