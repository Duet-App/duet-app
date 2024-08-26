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
    getInboxTasks()
  })

  const [inboxTasks, setInboxTasks] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)

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
        setInboxTasks(result.docs)
        setIsLoaded(true)
      }
    }).catch((err: Error) => {
      console.log(err)
    })
  }

  // if(!isLoaded) {
  //   return (
  //     // <TasksSkeletonLoader title="Inbox"></TasksSkeletonLoader>
  //     // <IonPage>
  //     //   <IonHeader>
  //     //     <IonToolbar>
  //     //       <IonButtons slot='start'>
  //     //         <IonBackButton defaultHref="/"></IonBackButton>
  //     //       </IonButtons>
  //     //       <IonTitle>Inbox</IonTitle>
  //     //     </IonToolbar>
  //     //   </IonHeader>
  //     //   <IonContent fullscreen>
  //     //     <IonList>
  //     //       <IonItem>
  //     //         <div slot="start">
  //     //           <IonSkeletonText animated={true} style={{width: 24, height: 24, borderRadius: '50%'}}></IonSkeletonText>
  //     //         </div>
  //     //         <IonLabel>
  //     //           <IonSkeletonText animated={true}></IonSkeletonText>
  //     //           <IonSkeletonText animated={true} style={{width: '20%'}}></IonSkeletonText>
  //     //         </IonLabel>
  //     //       </IonItem>
  //     //       <IonItem>
  //     //         <div slot="start">
  //     //           <IonSkeletonText animated={true} style={{width: 24, height: 24, borderRadius: '50%'}}></IonSkeletonText>
  //     //         </div>
  //     //         <IonLabel>
  //     //           <IonSkeletonText animated={true}></IonSkeletonText>
  //     //           <IonSkeletonText animated={true} style={{width: '20%'}}></IonSkeletonText>
  //     //         </IonLabel>
  //     //       </IonItem>
  //     //       <IonItem lines="none">
  //     //         <div slot="start">
  //     //           <IonSkeletonText animated={true} style={{width: 24, height: 24, borderRadius: '50%'}}></IonSkeletonText>
  //     //         </div>
  //     //         <IonLabel>
  //     //           <IonSkeletonText animated={true}></IonSkeletonText>
  //     //           <IonSkeletonText animated={true} style={{width: '20%'}}></IonSkeletonText>
  //     //         </IonLabel>
  //     //       </IonItem>
  //     //     </IonList>
  //     //   </IonContent>
  //     // </IonPage>
  //   )
  // }

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
        {/* <IonHeader collapse='condense'>
          <IonToolbar>
            <IonTitle size='large'>Inbox</IonTitle>
          </IonToolbar>
        </IonHeader> */}
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

        {/* <IonModal ref={statusPickerModal} className="statusPickerModal">
          <h4 style={{padding: '12px 16px 6px'}}>Change status</h4>
          <IonList>
            <IonItem lines="none" button detail={false}>
              <IonIcon color="medium" icon={ellipseOutline} slot="start"></IonIcon>
              <IonLabel>Todo</IonLabel>
            </IonItem>
            <IonItem lines="none" button detail={false}>
              <IonIcon color="primary" icon={chevronForwardCircle} slot="start"></IonIcon>
              <IonLabel>Next</IonLabel>
            </IonItem>
            <IonItem lines="none" button detail={false}>
              <IonIcon color="medium" icon={pauseCircle} slot="start"></IonIcon>
              <IonLabel>Waiting</IonLabel>
            </IonItem>
            <IonItem lines="none" button detail={false}>
              <IonIcon color="success" icon={checkmarkCircle} slot="start"></IonIcon>
              <IonLabel>Done</IonLabel>
            </IonItem>
            <IonItem lines="none" button detail={false}>
              <IonIcon color="medium" icon={closeCircle} slot="start"></IonIcon>
              <IonLabel>Cancelled</IonLabel>
            </IonItem>
          </IonList>
          <div style={{padding: 8}}></div>
        </IonModal> */}
      </IonContent>
    </IonPage>
  )
}

export default Inbox