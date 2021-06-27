document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(reply_email) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#detail-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // If reply_email then populate composition fields
  if (reply_email.to !== undefined) {
      document.querySelector('#compose-recipients').value = `${reply_email['to']}`;
      if (!reply_email.subject.startsWith('RE')) {
          reply_email.subject = 'RE: ' + reply_email.subject
      }
      document.querySelector('#compose-subject').value = `${reply_email['subject']}`;
      document.querySelector('#compose-body').value = `\n\n> On ${reply_email['timestamp']} ${reply_email['to']} wrote: \n> ${reply_email.body}`;
      };

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

function load_email(id, mailbox) {

    // Show the detail_view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#detail-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';

    // Toggle reply and archive buttons
    if (mailbox === 'inbox') {
        document.querySelector('#archive').style.display = 'inline-block';
        document.querySelector('#reply').style.display = 'inline-block';
    } else if (mailbox === 'sent') {
        document.querySelector('#archive').style.display = 'none';
        document.querySelector('#reply').style.display = 'none';
    } else {
        document.querySelector('#archive').style.display = 'inline-block';
        document.querySelector('#reply').style.display = 'none';
    }

    // fetch the email
    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
        document.querySelector('#sender').innerHTML = 'From: '.bold() + `${email.sender}`;
        document.querySelector('#recipients').innerHTML = 'To: '.bold() + `${email.recipients}`;
        document.querySelector('#subject').innerHTML = 'Subject: '.bold() + `${email.subject}`;
        document.querySelector('#timestamp').innerHTML = 'Timestamp: '.bold() + `${email.timestamp}`;
        document.querySelector('#body').innerHTML = `${email.body}`;
        // Mark as read
        fetch(`/emails/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                read: true
            })
        });
        //Change #archive button appropriatly
        const archive_button = document.querySelector('#archive')
        if (email.archived === true) {
            archive_button.innerHTML = 'Unarchive'
        } else {
            archive_button.innerHTML = 'Archive'
        }
        // Archive/unarchive
        archiver = !email.archived;
        archive_button.addEventListener('click', function(){
            fetch(`/emails/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: archiver
                })
            });
            setTimeout(function() { load_mailbox('inbox'); }, 200);

        });
        //Collect email content and pass it to compose function to make a reply
        document.querySelector('#reply').addEventListener('click', function(){
            var reply_email = {
                'to': email.sender,
                'subject': email.subject,
                'body': email.body,
                'timestamp': email.timestamp,
            }
            compose_email(reply_email);
        });
    });
}


function load_mailbox(mailbox) {

    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#detail-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';


  // Show the mailbox name
  const emails_view = document.querySelector('#emails-view')
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Fetch emails from appropriate mailbox and append them
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      emails.forEach(function(email) {
         // Creating elements of email list element
         header = document.createElement('span');
         header.innerHTML = `${email.sender}: `.bold() + ` ${email.subject}`;
         stamp = document.createElement('span');
         stamp.className = 'gray'
         stamp.innerHTML = `${email.timestamp}`
         // Creating a to join all the elements of the emails header
         const a = document.createElement('a');
         a.href = '#';
         a.className = 'email';
         a.appendChild(header);
         a.appendChild(stamp);
         a.addEventListener('click', () => load_email(email.id, mailbox));
         if (email.read === true) {
             a.className = 'read';
         }
         emails_view.append(a);
      })
      stop();
  })
}
