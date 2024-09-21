import { IonBackButton, IonButton, IonButtons, IonCheckbox, IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonModal, IonPage, IonRippleEffect, IonRow, IonSkeletonText, IonSpinner, IonText, IonTitle, IonToolbar, useIonModal, useIonRouter, useIonViewDidEnter } from "@ionic/react"
import { add, checkmarkCircle, chevronForwardCircle, closeCircle, closeCircleOutline, ellipseOutline, pauseCircle } from "ionicons/icons";
import { useEffect, useRef, useState } from "react";
import PouchDB from "pouchdb"
import PouchFind from "pouchdb-find"

import '../taskList.css'
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import TaskItem from "../components/Tasks/TaskItem";
import TasksSkeletonLoader from "../components/TasksSkeletonLoader";

const Waiting: React.FC = () => {

  const db = new PouchDB('duet');
  PouchDB.plugin(PouchFind)

  const router = useIonRouter()
  const statusPickerModal = useRef<HTMLIonModalElement>(null)

  useIonViewDidEnter(() => {
    getWaitingTasks()
  })

  const [waitingTasks, setWaitingTasks] = useState<Task[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  function getWaitingTasks() {
    db.find({
      selector: {
        type: "task",
        status: "Waiting",
        "timestamps.created": {
          "$gt": null
        },
      },
      sort: [{'timestamps.created': 'asc'}]
    })
    .then((result) => {
      if(result) {
        let docs: Task[] = result.docs as Task[]
        setWaitingTasks(docs)
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
          <IonTitle>Waiting for</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {
          !isLoaded
          ? <TasksSkeletonLoader />
          : waitingTasks.length == 0
          ? <div className="ion-padding">
            <IonText color='medium'>You are not waiting on any tasks.</IonText>
          </div>
          : <IonList>
            {
              waitingTasks.map(task => {
                return (
                  <TaskItem key={task._id} task={task} updateFn={getWaitingTasks} />
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

export default Waiting