import { IonBackButton, IonButtons, IonCheckbox, IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonPage, IonRow, IonText, IonTitle, IonToolbar, useIonViewDidEnter } from "@ionic/react"
import { add } from "ionicons/icons";
import { useEffect, useState } from "react";
import PouchDB from "pouchdb"
import PouchFind from "pouchdb-find"

const LogbookPage: React.FC = () => {

  const db = new PouchDB('duet');
  PouchDB.plugin(PouchFind)

  // useEffect(() => {
  //   function getInboxTasks() {
  //     db.find({
  //       selector: {
  //         type: "task",
  //         status: "Todo",
  //       },
  //       // "use_index": ['inbox-items', 'inbox-items'],
  //       // sort: [{'timestamps.created': 'asc'}, {'title': 'asc'}]
  //     })
  //     .then((result: object | null) => {
  //       if(result) {
  //         setInboxTasks(result.docs)
  //       }
  //     }).catch((err: Error) => {
  //       console.log(err)
  //     })
  //   }

  //   getInboxTasks()
  // }, [])

  useIonViewDidEnter(() => {
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
          setInboxTasks(result.docs)
        }
      }).catch((err: Error) => {
        console.log(err)
      })
    }

    getInboxTasks()
  })

  const [inboxTasks, setInboxTasks] = useState([])

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonBackButton defaultHref="/"></IonBackButton>
          </IonButtons>
          <IonTitle>Logbook</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className='ion-padding'>
        {
          inboxTasks.length == 0
          ? <IonText color='medium'>Your Logbook is empty. Complete some tasks for them to show up here.</IonText>
          : <IonList>
            {
              inboxTasks.map(task => {
                return (
                  <IonItem key={task._id} routerLink={"/tasks/" + task._id}>
                    <IonCheckbox legacy={true} slot="start"></IonCheckbox>
                    <IonLabel
                      style={{textDecoration: task.status == "Done" ? 'line-through' : 'none'}}
                      color={task.status == "Done" ? 'medium' : 'initial'}
                    >
                      {task.title}
                    </IonLabel>
                  </IonItem>
                )
              })
            }
          </IonList>
        }
      </IonContent>
    </IonPage>
  )
}

export default LogbookPage