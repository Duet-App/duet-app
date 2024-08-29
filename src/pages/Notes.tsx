import { IonAvatar, IonBackButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, IonTitle, IonToolbar, useIonViewDidEnter } from "@ionic/react"
import { add, documentTextSharp } from "ionicons/icons"
import PouchDB from "pouchdb"
import PouchFind from "pouchdb-find"
import { useState } from "react"
import NoteItem from "../components/Notes/NoteItem"

const NotesPage: React.FC = () => {

  const db = new PouchDB('duet');
  PouchDB.plugin(PouchFind)

  const [notes, setNotes] = useState([])

  useIonViewDidEnter(() => {
    function getNotes() {
      db.find({
        selector: {
          type: "note",
        },
        // "use_index": ['inbox-items', 'inbox-items'],
        // sort: [{'timestamps.created': 'asc'}, {'title': 'asc'}]
      })
      .then((result: object | null) => {
        if(result) {
          setNotes(result.docs)
        }
      }).catch((err: Error) => {
        console.log(err)
      })
    }

    getNotes()
  })

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
          notes.length > 0
          ?  <IonList>
            {
              notes.map(note => {
                return (
                  <NoteItem key={note._id} note={note} />
                  // <IonItem routerLink={"/notes/details/" + note._id}>
                  //   <IonIcon slot="start" icon={documentTextSharp}></IonIcon>
                  //   <IonLabel>{note.title}</IonLabel>
                  // </IonItem>
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