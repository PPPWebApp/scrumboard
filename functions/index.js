const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);


const mailTransport = nodemailer.createTransport(
  `smtps://${"magson.dev@gmail.com"}:${"m@gs0n123"}@smtp.gmail.com`);

exports.newRequest = functions.firestore
  .document('teams/{teamId}')
  .onUpdate((change, context) => {
    const newData = change.after.data();
    let uid;
    const teamName = newData.name;
    const teamId = context.params.teamId;

    const members = newData.members;
    let mail = false;
    Object.keys(members).forEach(function (key, idx) {
      if (members[key] === 'mail') { // if send mail
        mail = true;
        uid = key;
        console.log({uid});
        return admin.auth().getUser(uid)
          .then(function (userRecord) {
            let userEmail = userRecord.toJSON().email;
            return sendInvite(userEmail, uid, teamName, teamId).then(() => {
              return admin.firestore().doc('teams/' + teamId).get().then(doc => {
                let members = doc.data().members;
                members[uid] = false;
                admin.firestore().doc(`teams/${teamId}`).update({
                  members
                });
              })
            });
          });
      }
    });
    if (mail === false) {
      console.log('cancelling');
      return null;
    }
  });

function sendInvite(email, uid, teamName, teamId) {
  const mailOptions = {
    from: 'MAGSON <support@magson.no>',
    to: email
  };

  mailOptions.subject = `Invitation to join ${teamName}`;
  mailOptions.html = `
        <h1>Magson Scrum</h1>
        <p>You have been invited to join ${teamName} on Magson scrum</p>
        <p>To join, click the button below</p>
        <br>
        <a href="https://us-central1-magson-developer.cloudfunctions.net/addMember?uid=${uid}&teamId=${teamId}&teamName=${teamName}"> Join </a>
        <p>If you do not want to join this project, please disregard this email.</p>
        <br>
        <br>
        <p>The Magson team</p>
        `
  return mailTransport.sendMail(mailOptions)
}

exports.addMember = functions.https.onRequest((req, res) => {
  const UID = getParameterByName('uid', req.url);
  const teamId = getParameterByName('teamId', req.url);
  const teamName = getParameterByName('teamName', req.url);

  var Members;

  admin.firestore().doc(`teams/${teamId}`).get().then(doc => {
    Members = doc.data().members;
    Members[UID] = true; // setting user to true in member object

    admin.firestore().doc(`teams/${teamId}`).update({
      members: Members
    }).then(() => res.send(`You have succesfully joined ${teamName}`));
  });

});


function getParameterByName(name, url) {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function removeA(arr) {
  var what, a = arguments,
    L = a.length,
    ax;
  while (L > 1 && arr.length) {
    what = a[--L];
    while ((ax = arr.indexOf(what)) !== -1) {
      arr.splice(ax, 1);
    }
  }
  return arr;
}
