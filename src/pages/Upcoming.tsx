import { IonBackButton, IonButtons, IonCheckbox, IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonPage, IonRow, IonText, IonTitle, IonToolbar, isPlatform, useIonViewDidEnter } from "@ionic/react"
import { add } from "ionicons/icons";
import { useEffect, useState } from "react";
import PouchDB from "pouchdb"
import PouchFind from "pouchdb-find"
import CordovaSqlite from "pouchdb-adapter-cordova-sqlite"
import { endOfToday, formatISO, startOfToday } from "date-fns";
import TaskItem from "../components/Tasks/TaskItem";

const Upcoming: React.FC = () => {

  let db: PouchDB.Database
  if(isPlatform('capacitor')) {
    PouchDB.plugin(CordovaSqlite)
    db = new PouchDB('duet', {adapter: 'cordova-sqlite'})
  } else {
    db = new PouchDB('duet');
  }
  PouchDB.plugin(PouchFind)

  useIonViewDidEnter(() => {
    getUpcomingTasks()
  })

  async function getUpcomingTasks() {
    const result = await db.find({
      selector: {
        "$or": [
          {
            status: "Next"
          },
          {
            status: "Todo"
          }
        ],
        "$and": [
          {
            type: "task",
          },
          {
            "scheduled_date": {
              "$gt": formatISO(endOfToday())
            },
          },
        ],
      },
      // "use_index": ['inbox-items', 'inbox-items'],
      sort: [{'scheduled_date': 'asc'}]
    })
    setUpcomingTasks(result.docs)
  }

  const [upcomingTasks, setUpcomingTasks] = useState([])

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot='start'>
            <IonBackButton defaultHref="/"></IonBackButton>
          </IonButtons>
          <IonTitle>Upcoming</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {
          upcomingTasks.length == 0
          ? <div className="ion-padding">
            <IonText color='medium'>No upcoming tasks. Add new tasks using the blue button below.</IonText>
          </div>
          : <IonList>
            {
              upcomingTasks.map(task => {
                return (
                  <TaskItem key={task._id} task={task} updateFn={getUpcomingTasks} />
                  // <IonItem key={task._id} routerLink={"/tasks/" + task._id}>
                  //   <IonCheckbox legacy={true} slot="start"></IonCheckbox>
                  //   <IonLabel style={{textDecoration: task.status == "Done" ? 'line-through' : 'none'}} color={task.status == "Done" ? 'medium' : 'initial'}>{task.title}</IonLabel>
                  // </IonItem>
                )
              })
            }
          </IonList>
        }

        <IonFab slot='fixed' vertical='bottom' horizontal='end'>
          <IonFabButton routerLink="/add-task">
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  )
}

export default Upcoming