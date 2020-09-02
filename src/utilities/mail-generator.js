let HTMLing = require('htmling');





const generalTemplate = (body, hostname) =>{
    let template = HTMLing.file('src/mail-templates/email_template.html');
    let signUptemplate = HTMLing.file('src/mail-templates/sign_up_email_template.html');
    
    
    if(body.signUp){
        return signUptemplate.render(body)
    } else {
        return template.render(body)
    }    
}

module.exports = generalTemplate;

