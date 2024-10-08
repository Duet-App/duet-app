import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonRow, IonText, isPlatform, useIonViewDidEnter } from "@ionic/react"
import { useEffect, useState } from "react"
import PouchDB from 'pouchdb'
import PouchFind from 'pouchdb-find'
import CordovaSqlite from "pouchdb-adapter-cordova-sqlite"
import { endOfToday, formatISO } from "date-fns"

const NotesCard: React.FC = () => {

  let db: PouchDB.Database
  if(isPlatform('capacitor')) {
    PouchDB.plugin(CordovaSqlite)
    db = new PouchDB('duet', {adapter: 'cordova-sqlite'})
  } else {
    db = new PouchDB('duet')
  }
  PouchDB.plugin(PouchFind)

  const [notesCount, setNotesCount] = useState(0)

  useIonViewDidEnter(() => {
    async function getNotesCount() {
      const result = await db.find({
        selector: {
          type: "note",
        }
      })
      setNotesCount(result.docs.length)
    }

    getNotesCount()
  })

  return (
    <>
      <IonCard routerLink="/notes">
        <IonCardHeader>
          <IonCardTitle>Notes</IonCardTitle>
          <IonCardSubtitle>Notes and Project Support Material</IonCardSubtitle>
        </IonCardHeader>
        <IonCardContent>
          <IonRow>
            <IonCol>
              <IonText color='primary'>
                <h1>{notesCount}</h1>
                <p>{notesCount == 1 ? 'Note' : 'Notes'}</p>
              </IonText>
            </IonCol>
          </IonRow>
        </IonCardContent>
      </IonCard>
    </>
  )
}

export default NotesCard