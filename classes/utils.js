class Utils{
    /* Método que formata a data, transformando ela para o padrão que usamos no Brasil.
    Esse método está sendo usado para formatar a data de criação do usuário. */
    static dateFormat(date){
        return new Date(date).getDate() + '/' + (new Date(date).getMonth()+1) + '/' + new Date(date).getFullYear() + ' ' + new Date(date).getHours() + ':' + new Date(date).getMinutes()
    }
}