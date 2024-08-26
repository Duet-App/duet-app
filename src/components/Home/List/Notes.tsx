import { IonAvatar, IonBackButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, IonTitle, IonToolbar, useIonViewDidEnter } from "@ionic/react"
import { add, documentTextSharp } from "ionicons/icons"
import PouchDB from "pouchdb"
import PouchFind from "pouchdb-find"
import { useState } from "react"
import NoteItem from "../../Notes/NoteItem"

const NotesTile: React.FC = () => {

  const db = new PouchDB('duet');
  PouchDB.plugin(PouchFind)

  const [notes, setNotes] = useState([])

  useIonViewDidEnter(() => {
    function getNotes() {
      db.find({
        selector: {
          "timestamps.updated": {
            "$gt": null
          },
          type: "note",
        },
        // "use_index": ['inbox-items', 'inbox-items'],
        sort: [{'timestamps.updated': 'desc'}],
        limit: 3
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
    <>
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
          <IonText color="medium">No notes found!</IonText>
        </div>
      }
    </>
  )
}

export default NotesTile