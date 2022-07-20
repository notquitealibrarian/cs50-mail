document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Selects the form itself, NOT the submit button, and when the user clicks submit, runs the send_email function
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  var email_view = document.querySelector('#emails-view');

  // Show the mailbox name
    email_view.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Get the emails using the provided API
  fetch('/emails/' + mailbox)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);

    emails.forEach(email => {
      let email_line = document.createElement('div');
      email_line.innerHTML = `
            <span class="sender col-3"> <b>${email['sender']}</b> </span>
            <span class="subject col-6"> ${email['subject']} </span>
            <span class="timestamp col-3"> ${email['timestamp']} </span>
        `;
      email_view.appendChild(email_line);
    })
  });
}

function send_email(event) {

  // Prevents the "normal" behavior from this type of event
  event.preventDefault()

  // Uses the provided API to "send" emails
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({

        // Note, could also use querySelector here
        recipients: document.getElementById('compose-recipients').value,
        subject: document.getElementById('compose-subject').value,
        body: document.getElementById('compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  })

  // Loads the sent mailbox after sending message.
  .then(response => load_mailbox('sent'));
}