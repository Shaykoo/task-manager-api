const sgMail = require('@sendgrid/mail')
// const sendgridAPIKey = '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'

sgMail.setApiKey(process.env.SENDGRID_API_KEY) // setting up the API key

const sendWelcomeEmails = (email, name)=>{
    sgMail.send({
        to: email,
        from: 'aspragamatic@gmail.com',
        subject:'Welcome and thanks for choosing us!',
        text: `Thanks ${name} for choosing us, hope we will serve you better. Cheers ${name}!`
    })
}

const sendCancelationEmail = (email, name)=>{
    sgMail.send({
        to: email,
        from: 'aspragamatic@gmail.com',
        subject:'Subscription Cancelled',
        text: `Thanks ${name} for serving you, hope we will serve you better in the near future. We will wait for you to come back ${name}!`
    })
}
module.exports = {
    sendWelcomeEmails,
    sendCancelationEmail
}