import { TeamsInterface } from './../../extra/TeamsInterface';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireFunctions } from 'angularfire2/functions';
import { BoardsService } from './../../services/boards.service';
import { AuthServiceService } from './../../services/auth-service.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';

@Component({
  selector: 'app-teams-module',
  templateUrl: './teams-module.component.html',
  styleUrls: ['./teams-module.component.css']
})
export class TeamsModuleComponent implements OnInit {

  constructor(
    public boardsService: BoardsService,
    public router: Router,
    public afs: AngularFirestore,
    public auth: AuthServiceService,
    public route: ActivatedRoute,
    public afFunctions: AngularFireFunctions) {
  }

  ngOnInit() {
  }

  selectTeam(teamId: string) {
    console.log({ teamId });
    localStorage.previousSelectedTeam = teamId;
    this.router.navigate(['/', teamId]);
  }

  async createNewTeam() {
    this.auth.user$.filter(user => user != null).subscribe(async user => {
      const currentUser = user;
      const { value: name } = await swal({
        title: 'What is the name of the team?',
        input: 'text',
        inputPlaceholder: 'Teamname',
        showCancelButton: true,
        reverseButtons: true,
        inputValidator: (value) => {
          return !value && 'You need to write a team name!';
        }
      });
      if (name) {
        const uid = currentUser.uid;
        const team = {
          name,
          members: { [uid]: true }
        };
        this.afs.collection<TeamsInterface>('teams').add(team);
      }
    });
  }
  addMember(teamId: string, teamName: string) {

    swal.queue([{
      title: `Add member to ${teamName}`,
      text: 'Type in the email of the user you want to invite',
      input: 'email',
      inputPlaceholder: 'Email',
      confirmButtonText: 'Invite',
      showCancelButton: true,
      reverseButtons: true,
      showLoaderOnConfirm: true,
      preConfirm: (inputValue) => {
        const getUserByMail = this.afFunctions.httpsCallable('getUserByMail');
        return getUserByMail({ mail: inputValue }).toPromise()
          .then(function (data) {
            const uid = data.userData.uid;
            const imageUrl = data.userData.photoURL;
            const displayName = data.userData.displayName;
            const email = data.userData.email;

            swal.insertQueueStep({
              text: `Are you sure you want to add ${displayName} to ${teamName}?`,
              imageUrl: imageUrl,
              imageWidth: 100,
              imageHeight: 100,
              imageAlt: 'Scrumboard user profile',
              confirmButtonText: 'Add',
              showCancelButton: true,
              reverseButtons: true,
            }); /* .then((result) => {
              // add to team
              console.log('add to team');
              const ref = this.afs.firestore.doc('teams/' + teamId);
              this.afs.firestore.runTransaction(transaction =>
                transaction.get(ref).then(doc => {
                  const members = doc.data().members;
                  members[uid] = 'mail';
                  return transaction.update(ref, { members });
                }).then(() => {
                  swal({
                    title: `Success`,
                    type: 'success',
                    text: 'You have successfully added a new member',
                  });
                })
                  .catch(err => {
                    console.log('Error', err);
                    alert(err);
                  })
              );
            }); */
          }).catch(function (error) {
            swal.insertQueueStep({
              title: 'Could not find user',
              text: error.message,
              type: 'error',
            });

          });
      }
    }]);
  }

  leaveTeam(teamId: string, ) {
    // update members
    this.auth.user$.filter(user => user != null).take(1).subscribe(user => {
      const ref = this.afs.firestore.doc(`teams/${teamId}`);
      this.afs.firestore.runTransaction(transaction =>
        transaction.get(ref).then(doc => {
          const members = doc.data().members;
          delete members[user.uid];
          return transaction.update(ref, { members });
        }).then(() => {
          swal({
            title: `Success`,
            type: 'success',
            text: 'You have successfully left this team',
          });
        })
          .catch(err => {
            console.log('Error', err);
            alert(err);
          })
      );
    });

  }
}
