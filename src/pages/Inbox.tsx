import { IonBackButton, IonButton, IonButtons, IonCheckbox, IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonModal, IonPage, IonRippleEffect, IonRow, IonSkeletonText, IonSpinner, IonText, IonTitle, IonToolbar, useIonModal, useIonRouter, useIonViewDidEnter } from "@ionic/react"
import { add, checkmarkCircle, chevronForwardCircle, closeCircle, closeCircleOutline, ellipseOutline, pauseCircle } from "ionicons/icons";
import { useEffect, useRef, useState } from "react";
import PouchDB from "pouchdb"
import PouchFind from "pouchdb-find"

import '../taskList.css'
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import TaskItem from "../components/Tasks/TaskItem";
import TasksSkeletonLoader from "../components/TasksSkeletonLoader";

const Inbox: React.FC = () => {

  const db = new PouchDB('duet');
  PouchDB.plugin(PouchFind)

  const router = useIonRouter()
  const statusPickerModal = useRef<HTMLIonModalElement>(null)

  useIonViewDidEnter(() => {
    getInboxTasks()
  })

  const [inboxTasks, setInboxTasks] = useState<Task[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  function getInboxTasks() {
    db.find({
      selector: {
        type: "task",
        status: "Todo",
        "timestamps.created": {
          "$gt": null
        },
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
      sort: [{'timestamps.created': 'asc'}]
    })
    .then((result) => {
      if(result) {
        setInboxTasks(result.docs as Task[])
        setIsLoaded(true)
      }
    }).catch((err: Error) => {
      console.log(err)
    })
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot='start'>
            <IonBackButton defaultHref="/"></IonBackButton>
          </IonButtons>
          <IonTitle>Inbox</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {
          !isLoaded
          ? <TasksSkeletonLoader />
          : inboxTasks.length == 0
          ? <div className="ion-padding">
            <IonText color='medium'>Your inbox is clear! Add new tasks using the blue button below.</IonText>
          </div>
          : <IonList>
            {
              inboxTasks.map(task => {
                return (
                  <TaskItem key={task._id} task={task} updateFn={getInboxTasks} />
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

export default Inbox