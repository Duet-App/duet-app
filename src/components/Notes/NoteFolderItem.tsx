import { IonIcon, IonItem, IonLabel } from "@ionic/react"
import { folderSharp } from "ionicons/icons"

import '../../notesList.css'

const NoteFolderItem = ({key, folder}: {key: string, folder: {full: string, current: string}}) => {

  return (
    <IonItem className="noteListItem" routerLink={`/notes/folder/${folder.full}`}>
      <div className="icon-wrapper" slot="start">
        <IonIcon slot="start" color="medium" icon={folderSharp}></IonIcon>
      </div>
      <IonLabel>{folder.current}</IonLabel>
    </IonItem>
  )
}

export default NoteFolderItem