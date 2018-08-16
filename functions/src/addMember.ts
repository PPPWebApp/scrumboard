import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Confirm adding the user to the team by confirmation link 

export const addMember = functions.https.onRequest(async (req, res) => {
    const uid = getParameterByName('uid', req.url);
    const teamId = getParameterByName('teamId', req.url);
    const teamName = getParameterByName('teamName', req.url);

    const doc = await admin.firestore().doc(`teams/${teamId}`).get();
    const members = doc.data().members;
    if (members[uid] === false) { // make sure the user has been invited
        return false;
    }
    members[uid].isMember = true;
    await admin.firestore().doc(`teams/${teamId}`).update({
        members: members
    });
    return res.send(
        `
        <head>
          <link href="https://fonts.googleapis.com/css?family=Roboto:100,300" rel="stylesheet">
        </head>
          <body style="margin: 0;background-color: white;">
      <header style="background-color: #4285f4;padding: 75px 50px;">
          <h1 style="font-family:roboto;font-weight:500;text-align:center;color:white;margin:0;">Welcome to ${teamName}</h1>
      </header>
      <main style="display: table;margin: 0 auto;padding: 10px;">
          <br>
          <p style="font-family:roboto;font-weight:300;margin:0;margin-bottom:3px;color:#484848;font-size:18px;">
          You have been successfully added as a member to the ${teamName} team!</p>
          <p style="font-family:roboto;font-weight:300;margin:0;margin-bottom:3px;color:#484848;font-size:18px;">
          We are excited to see the faboulous work you will accomplish using our scrumboard.</p>
          <div style="display: table;margin: 100px auto;margin-bottom: 50px;">
              <a href="https://scrum.magson.no/${teamId}" style="font-family:roboto;font-weight:500;color:#4285f4;
              border:3px solid #4285f4;border-radius:5px;padding:20px;margin:20px 0;width:auto;cursor:pointer;
              transition:all .3s;">See ${teamName}´s scrumboard</a>
          </div>

          <br>
          <div class="footer" style="display:table;margin:10px auto;margin-bottom:50px;">
              <h3 style="font-family:roboto;font-weight:400;text-align:center;color:#484848;margin-bottom:5px;">The Magson team</h3>
              <img src="https://magson.no/images/logoWhite.jpg" alt="magsonLogo" style="width: 250px;">
          </div>
      </main>
  </body>`
    );
});

function getParameterByName(name: string, url: string) {
    const string = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + string + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) { return null; }
    if (!results[2]) { return ''; }
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
