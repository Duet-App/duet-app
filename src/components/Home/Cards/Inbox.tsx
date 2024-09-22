import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonRow, IonText, isPlatform, useIonViewDidEnter } from "@ionic/react"
import { useState } from "react"
import PouchDB from "pouchdb"
import PouchFind from "pouchdb-find"
import CordovaSqlite from "pouchdb-adapter-cordova-sqlite"

const Inbox: React.FC = () => {

  let db: PouchDB.Database
  if(isPlatform('capacitor')) {
    PouchDB.plugin(CordovaSqlite)
    db = new PouchDB('duet', {adapter: 'cordova-sqlite'})
  } else {
    db = new PouchDB('duet');
  }
  PouchDB.plugin(PouchFind)

  const [inboxTasksCount, setInboxTasksCount] = useState(0)

  useIonViewDidEnter(() => {
    function getInboxTasks() {
      db.find({
        selector: {
          type: "task",
          status: "Todo",
          "$or": [
            {
              project_id: {
                "$exists": false
              }
            },
            {
              project_id: null
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
      <IonCard routerLink="/inbox">
        <IonCardHeader>
          <IonCardTitle>Inbox</IonCardTitle>
          <IonCardSubtitle>Dump what's on your mind</IonCardSubtitle>
        </IonCardHeader>
        <IonCardContent>
          <IonRow>
            <IonCol>
              <IonText color='primary'>
                <h1>{inboxTasksCount}</h1>
                <p>{inboxTasksCount == 1 ? 'Item' : 'Items'}</p>
              </IonText>
            </IonCol>
          </IonRow>
        </IonCardContent>
      </IonCard>
    </>
  )
}

export default Inbox