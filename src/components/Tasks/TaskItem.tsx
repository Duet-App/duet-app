import { IonIcon, IonItem, IonLabel, IonRippleEffect, isPlatform, useIonModal, useIonRouter } from "@ionic/react";
import { calendarNumberOutline, checkmarkCircle, chevronForwardCircleOutline, ellipseOutline, folder, folderOutline, pauseCircleOutline, playOutline, removeCircle, syncOutline } from "ionicons/icons";
import StatusPickerModal from "./StatusPickerModal";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import PouchDB from "pouchdb"
import PouchFind from "pouchdb-find"
import CordovaSqlite from "pouchdb-adapter-cordova-sqlite"
import { format, formatRelative, isAfter, isBefore, isSameDay, isSameWeek, isThisWeek, isToday, isTomorrow, isYesterday, subDays } from "date-fns";

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

  const getShortTimestampString = (timestamp: string) => {
    if(isToday(timestamp)) {
      return format(timestamp, 'h:mm a')
    }
    if(isBefore(timestamp, Date.now())) {
      if(isYesterday(timestamp)) {
        return `Yd. ${format(timestamp, 'h:mm a')}`
      }
      if(isThisWeek(timestamp)) {
        return `L. ${format(timestamp, 'iiiiii h:mm a')}`
      } else {
        return format(timestamp, 'dd/mm/y h:mm a')
      }
    }
    if(isAfter(timestamp, Date.now())) {
      if(isTomorrow(timestamp)) {
        return `Tm. ${format(timestamp, 'h:mm a')}`
      }
      if(isThisWeek(timestamp)) {
        return format(timestamp, 'iiiiii h:mm a')
      } else {
        return format(timestamp, 'dd/mm/y h:mm a')
      }
    }
  }
  
  return (
    <IonItem className={"task-item " + ( router?.routeInfo.pathname.split("/").at(-1) === task._id ? "active" : "" )} key={task._id} button onClick={() => {router.push(url! + "/" + task._id)}}>
      <div slot="start" className="status-wrapper ion-activatable" onClick={(e) => {openModal(task._id); e.stopPropagation()}}>
        <IonRippleEffect type="unbounded"></IonRippleEffect>
        <IonIcon icon={task.recurs && task.recurs.recurs ? syncOutline : icons[task.status].icon} onClick={() => {}} color={icons[task.status].color}></IonIcon>
      </div>
      <IonLabel
        style={{textDecoration: task.status == "Done" ? 'line-through' : 'none'}}
        color={task.status == "Done" ? 'medium' : 'initial'}
      >
        {task.title}
        <p>
          {
            project
            ? <span style={{display: 'inline-flex', alignItems: 'center', gap: 4}}><IonIcon icon={folderOutline}></IonIcon> {project.title}</span>
            : null 
          }
          {
            task.scheduled_date
            ? <span style={{display: 'inline-flex', alignItems: 'center', gap: 4, paddingLeft: project ? '8px' : 0}}>
                <IonIcon icon={playOutline}></IonIcon> 
                {getShortTimestampString(task.scheduled_date)}
              </span> 
            : null
          }
          {
            task.due_date
            ? <span style={{display: 'inline-flex', alignItems: 'center', gap: 4, paddingLeft: task.scheduled_date != null ? '8px' : 0, color: isBefore(task.due_date, Date.now()) ? 'var(--ion-color-danger)' : 'var(--ion-color-medium)'}}>
                <IonIcon icon={calendarNumberOutline}></IonIcon> 
                {getShortTimestampString(task.due_date)}
              </span> 
            : null
          }
        </p>
        
      </IonLabel>
    </IonItem>
  )
}

export default TaskItem