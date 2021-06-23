document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

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

  document.querySelector('form').onsubmit = function() {
      fetch('/emails', {
          method: 'POST',
          body: JSON.stringify({
              recipients: document.querySelector('#compose-recipients').value,
              subject: document.querySelector('#compose-subject').value,
              body: document.querySelector('#compose-body').value,
          })
      })
      .then(response => response.json())
      .then(result => {
         console.log(result);
         if (!result['error']) {
             load_mailbox('sent');
         }

      });

      return false;
  };
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  const emails_view = document.querySelector('#emails-view')
  emails_view.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Create empty ul element and append to mailbox view
  const ul = document.createElement('ul');
  emails_view.append(ul)

  // Fetch emails from appropriate mailbox and append them as li inside ul
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      emails.forEach(function(email) {
          const li = document.createElement('li')
          li.innerHTML = `from: ${email.sender}, subject: ${email.subject}, at: ${email.timestamp}`
          document.querySelector('ul').appendChild(li)
      })

  })
}
