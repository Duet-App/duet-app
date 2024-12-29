import { IonIcon, IonItem, IonLabel, IonRippleEffect, isPlatform, useIonModal, useIonRouter } from "@ionic/react";
import { calendarNumberOutline, checkmarkCircle, chevronForwardCircleOutline, ellipseOutline, folder, folderOutline, pauseCircleOutline, removeCircle } from "ionicons/icons";
import StatusPickerModal from "./StatusPickerModal";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import PouchDB from "pouchdb"
import PouchFind from "pouchdb-find"
import CordovaSqlite from "pouchdb-adapter-cordova-sqlite"
import { formatRelative, subDays } from "date-fns";

const TaskItem: React.FC<TaskItemProps> = (props) => {

  let db: PouchDB.Database
  if(isPlatform('capacitor')) {
    document.addEventListener('deviceready', () => {
      PouchDB.plugin(CordovaSqlite)
      db = new PouchDB('duet', {adapter: "cordova-sqlite"});
    })
  } else {
    db = new PouchDB('duet');
  }

  const { task, updateFn, project, url } = props

  const router = useIonRouter()

  const icons = {
    "Todo": {
      icon: ellipseOutline,
      color: "medium"
    },
    "Next": {
      icon: chevronForwardCircleOutline,
      color: "primary"
    },
    "Waiting": {
      icon: pauseCircleOutline,
      color: "medium"
    },
    "Done": {
      icon: checkmarkCircle,
      color: "success"
    },
    "Cancelled": {
      icon: removeCircle,
      color: "medium"
    },
  }

  const [present, dismiss] = useIonModal(StatusPickerModal, {
    dismiss: (data: string, role: string) => dismiss(data, role),
  });

  function openModal(id: string) {
    present({
      cssClass: 'statusPickerModal',
      onWillDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
        if (ev.detail.role === 'confirm') {
          updateTaskStatus(id, ev.detail.data)
        }
      },
    });
  }

  const updateTaskStatus = async (id: string, status: string) => {
    const timestamp = new Date().toISOString()
    
    db.get(id).then(task => {
      db.put({
        ...task,
        status: status || 'Todo',
        timestamps: {
          ...task.timestamps,
          updated: timestamp,
          completed: status == 'Done' ? timestamp : null
        }
      }).then(response => {
        if(response.ok) {
          updateFn()
        }
      })
    })
  }
  
  return (
    <IonItem className={"task-item " + ( router?.routeInfo.pathname.split("/").at(-1) === task._id ? "active" : "" )} key={task._id} button onClick={() => {router.push(url! + "/" + task._id)}}>
      <div slot="start" className="status-wrapper ion-activatable" onClick={(e) => {openModal(task._id); e.stopPropagation()}}>
        <IonRippleEffect type="unbounded"></IonRippleEffect>
        <IonIcon icon={icons[task.status].icon} onClick={() => {}} color={icons[task.status].color}></IonIcon>
      </div>
      <IonLabel
        style={{textDecoration: task.status == "Done" ? 'line-through' : 'none'}}
        color={task.status == "Done" ? 'medium' : 'initial'}
      >
        {task.title}
        <p>
          {
            project
            ? <span style={{display: 'inline-flex', alignItems: 'center', gap: 8}}><IonIcon icon={folderOutline}></IonIcon> {project.title}</span>
            : null 
          }
          {
            task.due_date
            ? <span style={{display: 'inline-flex', alignItems: 'center', gap: 8, paddingLeft: project ? '8px' : 0}}>
                <IonIcon icon={calendarNumberOutline}></IonIcon> 
                {formatRelative(task.due_date, new Date())}
              </span> 
            : null
          }
          {
            task.scheduled_date && task.due_date == null
            ? <span style={{display: 'inline-flex', alignItems: 'center', gap: 8}}>
                <IonIcon icon={calendarNumberOutline}></IonIcon> 
                {formatRelative(task.scheduled_date, new Date())}
              </span> 
            : null
          }
        </p>
        
      </IonLabel>
    </IonItem>
  )
}

export default TaskItem