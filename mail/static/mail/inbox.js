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

  // Allow easy access to the emails-view div by setting it to a variable
  var email_view = document.querySelector('#emails-view');

  // Show the mailbox name
    email_view.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Get the emails using the provided API
  fetch('/emails/' + mailbox)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);

    // Loops through each email in the retrieved emails
    emails.forEach(email => {

      // Create new div to house the particular elements of each element
      let email_line = document.createElement('div');

      // Sets the HTML of the created dev, displaying the sender, subject, and timestamp
      email_line.innerHTML = `
        <span class="sender col-3"> <b>${email['sender']}</b> </span>
        <span class="subject col-6"> ${email['subject']} </span>
        <span class="timestamp col-3"> ${email['timestamp']} </span>
      `;

      // Styles the div to add 1) a border and 2) background (white if unread, gray if read)
      email_line.setAttribute("style", "border: solid; border-width: thin;");
      if (email['read'] === true) {
        email_line.style.backgroundColor = 'gray';
      }
      else {
        email_line.style.backgroundColor = 'white';
      }

      // Create event listener for each email, that, when clicked, loads the function to view an individual email, load_email(id)
      email_line.addEventListener('click', () => load_email(email['id']));

      // Adds the created div to the afore-fetched emails-view div
      email_view.appendChild(email_line);
    })
  });
}

function load_email(id) {

  // Allow easy access to the emails-view div by setting it to a variable
  var email_view = document.querySelector('#emails-view');

  // Use the existing API to get the attributes of a specific email, specified by the id provided to the method
  fetch('/emails/' + id)
    .then(response => response.json())
    .then(email => {
      // Print email
      console.log(email);

      // Overwrite the existing HTML for the emails-view div with the attributes of the selected email.

      // if box is inbox, need to show archive button
      if (email['archived'] == false) {
        email_view.innerHTML = `
          <ul class="list-group">
            <li class="list-group-item"><b>From:</b> <span>${email['sender']}</span></li>
            <li class="list-group-item"><b>To: </b><span>${email['recipients']}</span></li>
            <li class="list-group-item"><b>Subject:</b> <span>${email['subject']}</span</li>
            <li class="list-group-item"><b>Time:</b> <span>${email['timestamp']}</span></li>
          </ul>
          <p class="m-2">${email['body']}</p>
          `;
        const archive_button = document.createElement('button');
        archive_button.className = "btn-primary m-1";
        archive_button.innerHTML = "Archive";
        archive_button.addEventListener('click', function() {
          fetch('/emails/' + id, {
            method: 'PUT',
            body: JSON.stringify({
              archived: true
            })
          })
          .then(response => load_mailbox('inbox'))
          });
        email_view.append(archive_button);
      }

      // if box is archive, need to show unarchive button TODO ADD BUTTON
      else if (email['archived'] == true){
        email_view.innerHTML = `
          <ul class="list-group">
            <li class="list-group-item"><b>From:</b> <span>${email['sender']}</span></li>
            <li class="list-group-item"><b>To: </b><span>${email['recipients']}</span></li>
            <li class="list-group-item"><b>Subject:</b> <span>${email['subject']}</span</li>
            <li class="list-group-item"><b>Time:</b> <span>${email['timestamp']}</span></li>
          </ul>
          <p class="m-2">${email['body']}</p>
          `;
        const archive_button = document.createElement('button');
        archive_button.className = "btn-primary m-1";
        archive_button.innerHTML = "Un-archive";
        archive_button.addEventListener('click', function() {
          fetch('/emails/' + id, {
            method: 'PUT',
            body: JSON.stringify({
              archived: false
            })
          })
          .then(response => load_mailbox('inbox'))
          });
        email_view.append(archive_button);
      }

      // else box is sent, no need to show any extra button
      else {
        email_view.innerHTML = `
          <ul class="list-group">
            <li class="list-group-item"><b>From:</b> <span>${email['sender']}</span></li>
            <li class="list-group-item"><b>To: </b><span>${email['recipients']}</span></li>
            <li class="list-group-item"><b>Subject:</b> <span>${email['subject']}</span</li>
            <li class="list-group-item"><b>Time:</b> <span>${email['timestamp']}</span></li>
          </ul>
          <p class="m-2">${email['body']}</p>
        `;
      }
    });
  
  fetch('/emails/' + id, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  });
}

function send_email(event) {

  // Prevents the "normal" behavior from this type of event (submitting form)
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

function archive_email(email_id) {
  fetch('/emails/' + email_id, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })
}