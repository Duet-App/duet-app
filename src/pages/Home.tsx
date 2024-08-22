import { IonActionSheet, IonButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonPage, IonRow, IonTitle, IonToolbar, isPlatform, useIonRouter } from '@ionic/react';
import Welcome from '../components/Home/Welcome';
import Inbox from '../components/Home/Inbox';
import Today from '../components/Home/Today';
import UpcomingCard from '../components/Home/Upcoming';
import ProjectsCard from '../components/Home/Projects';
import './Home.css';
import React, { useState } from 'react';
import PouchDB from 'pouchdb'
import PouchFind from 'pouchdb-find'
import LogbookCard from '../components/Home/Logbook';
import NotesCard from '../components/Home/Notes';
import { closeSharp, ellipsisVerticalSharp, helpCircleSharp, informationCircleSharp, settingsSharp } from 'ionicons/icons';
import ReloadPrompt from '../components/ReloadPrompt';
import { App, AppInfo } from '@capacitor/app';

const Home: React.FC = () => {

  const db = new PouchDB('duet')
  PouchDB.plugin(PouchFind)
  db.createIndex({
    index: {
      fields: ['timestamps.created']
    }
  })
  db.createIndex({
    index: {
      fields: ['scheduled_date']
    }
  })
  db.createIndex({
    index: {
      fields: ['status', 'type', 'project_id']
    }
  })
  db.createIndex({
    index: {
      fields: ['status', 'type', 'scheduled_date']
    }
  })
  db.createIndex({
    index: {
      fields: ['type']
    }
  })

  const tags_ddoc = {
    "_id": "_design/tags-ddoc",
    views: {
      "all-tags": {
        map: function mapFun(doc) {
          if(doc.tags && doc.tags.length > 0) {
            for(var idx in doc.tags) {
              emit(doc.tags[idx], null);
            }
          }
        }.toString(),
        reduce: function redFun(keys, values) {
          return keys;
        }.toString()
      }
    }
  }

  const projects_ddoc = {
    "_id": "_design/projects-ddoc",
    views: {
      "project-tasks": {
        map: function mapFun(doc) {
          if(doc.type == "project" && doc.tasks) {
            for(var i in doc.tasks) {
              emit([doc._id, Number(i)+1], {_id: doc.tasks[i]})
            }
          }
        }.toString()
      },
      "project-notes": {
        map: function mapFun(doc) {
          if(doc.type == "project" && doc.notes) {
            for(var i in doc.notes) {
              emit([doc._id, Number(i)+1], {_id: doc.notes[i]})
            }
          }
        }.toString()
      },
      "project-progress": {
        map: function mapFun(doc) {
          if(doc.type == "task" && doc.project_id) {
            emit(doc.project_id, {type: "task", status: doc.status});
          }
        }.toString(),
        reduce: function redFun(keys, values, rereduce) {
          if (rereduce) {
            return values;
          } else {
            var total = 0;
            var complete = 0;
            for(var i = 0; i < values.length; i++) {
              if(values[i].type == "task") {
                if(values[i].status == "Done" || values[i].status == "Cancelled") {
                  complete = complete + 1;
                }
                total = total + 1;
              }
            }
            return {total: total, complete: complete};
          }
        }.toString()
      }
    }
  }

  const projects_progress_ddoc = {
    "_id": "_design/projects-progress-ddoc",
    views: {
      "project-progress": {
        map: function mapFun(doc) {
          if(doc.type == "task" && doc.project_id) {
            emit(doc.project_id, {type: "task", status: doc.status});
          }
        }.toString(),
        reduce: function redFun(keys, values, rereduce) {
          if (rereduce) {
            return values;
          } else {
            var total = 0;
            var complete = 0;
            for(var i = 0; i < values.length; i++) {
              if(values[i].type == "task") {
                if(values[i].status == "Done" || values[i].status == "Cancelled") {
                  complete = complete + 1;
                }
                total = total + 1;
              }
            }
            return {total: total, complete: complete};
          }
        }.toString()
      }
    }
  }

  const projects_notes_ddoc = {
    "_id": "_design/projects-notes-ddoc",
    views: {
      "project-notes": {
        map: function mapFun(doc) {
          if(doc.type == "project" && doc.notes) {
            for(var i in doc.notes) {
              emit([doc._id, Number(i)+1], {_id: doc.notes[i]})
            }
          }
        }.toString()
      },
    }
  }

  const setupTagsDDoc = async () => {
    try {
      await db.put(tags_ddoc);
    } catch (err) {
      if (err.name !== 'conflict') {
        throw err;
      }
      // ignore if doc already exists
    }
  }

  const setupProjectsDDoc = async () => {
    let current_projects_ddoc_rev
    db.get("_design/projects-ddoc").then((response) => {
      current_projects_ddoc_rev = response._rev
    })
    try {
      await db.put({
        ...projects_ddoc,
        _rev: current_projects_ddoc_rev
      });
    } catch (err) {
      if (err.name !== 'conflict') {
        throw err;
      }
      // ignore if doc already exists
    }
  }

  const setupProjectsProgressDDoc = async () => {
    try {
      await db.put(projects_progress_ddoc);
    } catch (err) {
      if (err.name !== 'conflict') {
        throw err;
      }
      // ignore if doc already exists
    }
  }

  const setupProjectsNotesDDoc = async () => {
    try {
      await db.put(projects_notes_ddoc);
    } catch (err) {
      if (err.name !== 'conflict') {
        throw err;
      }
      // ignore if doc already exists
    }
  }

  setupTagsDDoc()
  setupProjectsDDoc()
  setupProjectsProgressDDoc()
  setupProjectsNotesDDoc()

  const router = useIonRouter()

  document.addEventListener('ionBackButton', (ev) => {
    ev.detail.register(-1, () => {
      App.exitApp();
    });
  });

  let appInfo: AppInfo
  App.getInfo().then(value => {
    appInfo = value
  })

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Duet</IonTitle>
          <IonButtons slot='end'>
            <IonButton id='openActionsSheet'>
              <IonIcon slot='icon-only' icon={ellipsisVerticalSharp} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Duet</IonTitle>
          </IonToolbar>
        </IonHeader>
        <Welcome />
        <Today /> 
        <Inbox />
        <UpcomingCard />
        <ProjectsCard />
        <NotesCard />
        <LogbookCard />

        <IonActionSheet
          trigger='openActionsSheet'
          header={isPlatform('capacitor') && appInfo! ? appInfo.name + ' v' + appInfo.version + '.' + appInfo.build + 'pre-release' : 'Duet v0.9.804 pre-release'}
          buttons={[
            {
              text: 'Settings',
              icon: settingsSharp,
              data: {
                action: 'openSettings'
              }
            },
            {
              text: 'Help',
              icon: helpCircleSharp,
              data: {
              }
            },
            {
              text: 'About',
              icon: informationCircleSharp,
              data: {
              }
            },
          ]}
          onDidDismiss={({detail}) => {
            if(detail.data?.action == 'openSettings') {
              router.push('/settings')
            }
          }}
        ></IonActionSheet>
        <ReloadPrompt />
      </IonContent>
    </IonPage>
  );
};

export default Home;
