import { NavbarService } from './../../services/navbar.service';
import { TeamsInterface } from './../../extra/TeamsInterface';
import { AngularFirestore } from 'angularfire2/firestore';
import { BoardsService } from './../../services/boards.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from '../../../../node_modules/rxjs/Observable';
import { Subscription } from '../../../../node_modules/rxjs';
import { FormControl, Validators } from '../../../../node_modules/@angular/forms';
import swal from 'sweetalert2';
import { AngularFireFunctions } from 'angularfire2/functions';



@Component({
  selector: 'app-team-settings',
  templateUrl: './team-settings.component.html',
  styleUrls: ['./team-settings.component.css']
})
export class TeamSettingsComponent implements OnInit, OnDestroy {

  team$: Observable<TeamsInterface>;

  sub: Subscription;

  constructor(public route: ActivatedRoute, public boardsService: BoardsService,
    public afs: AngularFirestore,
    public navbarService: NavbarService,
    public afFunctions: AngularFireFunctions) {
  }

  ngOnInit() {
    const teamId = this.route.snapshot.paramMap.get('teamId');
    this.team$ = this.afs.doc<TeamsInterface>('teams/' + teamId).valueChanges();
    this.navbarService.backBtn = true;
    this.sub = this.team$.subscribe(team => this.navbarService.title = team.name);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.navbarService.backBtn = false;
  }

  promoteAdmin() {

  }

  deleteMember() {

  }

  addMember(teamId: string, teamName: string, input: string) {
    const that = this;

    const getUserByMail = this.afFunctions.httpsCallable('getUserByMail');
    return getUserByMail({ mail: input }).toPromise()
      .then(function (data) {
        const uid = data.userData.uid;
        const imageUrl = data.userData.photoURL;
        const displayName = data.userData.displayName;

        swal.queue([{
          text: `Are you sure you want to add ${displayName} to ${teamName}?`,
          imageUrl: imageUrl,
          imageWidth: 100,
          imageHeight: 100,
          imageAlt: 'Scrumboard user profile',
          confirmButtonText: 'Add',
          showCancelButton: true,
          reverseButtons: true,
          showLoaderOnConfirm: true,
          preConfirm: () => {
            // add to team
            const ref = that.afs.firestore.doc('teams/' + teamId);
            that.afs.firestore.runTransaction(transaction => transaction.get(ref).then(doc => {
              const members = doc.data().members;
              members[uid] = 'mail';
              return transaction.update(ref, { members });
            }).then(() => {
              swal({
                title: `Success`,
                type: 'success',
                text: `You have successfully invited ${displayName} to your team!`,
              });
            })
              .catch(err => {
                swal({
                  title: 'Error',
                  text: err,
                  type: 'error'
                });
              }));
          }
        }]);
      }).catch(function (error) {
        swal.insertQueueStep({
          title: 'Could not find user',
          text: error.message,
          type: 'error',
        });

      });
  }
}

export class InputErrorsExample {
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);
}
