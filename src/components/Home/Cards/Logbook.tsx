import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonRow, IonText, isPlatform } from "@ionic/react"
import { useEffect, useState } from "react"
import PouchDB from "pouchdb"
import PouchFind from "pouchdb-find"
import CordovaSqlite from "pouchdb-adapter-cordova-sqlite"

const LogbookCard: React.FC = () => {

  let db: PouchDB.Database
  if(isPlatform('capacitor')) {
    PouchDB.plugin(CordovaSqlite)
    db = new PouchDB('duet', {adapter: 'cordova-sqlite'})
  } else {
    db = new PouchDB('duet');
  }
  PouchDB.plugin(PouchFind)

  const [inboxTasksCount, setInboxTasksCount] = useState(0)

  useEffect(() => {
    function getInboxTasks() {
      db.find({
        selector: {
          type: "task",
          "$or": [
            {
              status: "Done"
            },
            {
              status: "Cancelled"
            }
          ],
        },
        // "use_index": ['inbox-items', 'inbox-items'],
        // sort: [{'timestamps.created': 'asc'}, {'title': 'asc'}]
      })
      .then((result: object | null) => {
        if(result) {
          setInboxTasksCount(result.docs.length)
        }
      }).catch((err: Error) => {
        console.log(err)
      })
    }

    getInboxTasks()
  }, [])

  return (
    <>
      <IonCard routerLink="/logbook">
        <IonCardHeader>
          <IonCardTitle>Logbook</IonCardTitle>
          <IonCardSubtitle>Previously completed tasks</IonCardSubtitle>
        </IonCardHeader>
        <IonCardContent>
          <IonRow>
            <IonCol>
              <IonText color='primary'>
                <h1>{inboxTasksCount}</h1>
                <p>{inboxTasksCount == 1 ? 'Task' : 'Tasks'}</p>
              </IonText>
            </IonCol>
          </IonRow>
        </IonCardContent>
      </IonCard>
    </>
  )
}

export default LogbookCard