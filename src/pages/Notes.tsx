import { IonAvatar, IonBackButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, IonTitle, IonToolbar, useIonViewDidEnter } from "@ionic/react"
import { add, documentTextSharp, folderSharp } from "ionicons/icons"
import PouchDB from "pouchdb"
import PouchFind from "pouchdb-find"
import { useState } from "react"
import NoteItem from "../components/Notes/NoteItem"
import NoteFolderItem from "../components/Notes/NoteFolderItem"

const NotesPage: React.FC = () => {

  const db = new PouchDB('duet');
  PouchDB.plugin(PouchFind)

  const [notes, setNotes] = useState([])
  const [folders, setFolders] = useState([])

  useIonViewDidEnter(() => {
    getNotes()
    getFolderPaths()
  })

  function getNotes() {
    db.find({
      selector: {
        type: "note",
        "timestamps.updated": {
          "$gt": null
        },
        "$or": [
          {
            "path": null
          },
          {
            "path": {
              "$exists": false
            }
          }
        ],
        "project_id": {
          "$exists": false
        }
      },
      sort: [{'timestamps.updated': 'desc'}]
    })
    .then((result: object | null) => {
      if(result) {
        setNotes(result.docs)
      }
    }).catch((err: Error) => {
      console.log(err)
    })
  }

  function getFolderPaths() {
    db.find({
      selector: {
        "type": "note",
        "path": {
          "$exists": true
        }
      }
    }).then(result => {
      let data = result.docs!
      let root =  []
      data.forEach(doc => {
        let folder = doc.path.match(/,(.*?),/)
        if(!root.includes(folder[1])) {
          root.push(folder[1])
        }
      })
      setFolders(root)
    })
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot='start'>
            <IonBackButton defaultHref="/"></IonBackButton>
          </IonButtons>
          <IonTitle>Notes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {
          folders.length > 0
          ? <IonList>
            {
              folders.map((folder) => {
                return (
                  <NoteFolderItem key={folder} folder={{full: folder, current: folder}} />
                )
              })
            }
          </IonList>
          : null
        }
        {
          notes.length > 0
          ?  <IonList>
            {
              notes.map(note => {
                return (
                  <NoteItem key={note._id} note={note} />
                )
              })
            }
          </IonList>
          : <div className="ion-padding">
            <IonText color="medium">No notes found! Add a note by using the button below.</IonText>
          </div>
        }

        <IonFab slot='fixed' vertical='bottom' horizontal='end'>
          <IonFabButton routerLink="/notes/add">
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  )
}

export default NotesPage