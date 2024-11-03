import { IonRouterOutlet } from "@ionic/react"
import { Route } from "react-router"
import Home from "../pages/Home"

const ThreePaneUI: React.FC = () => {
  return (
    <>
      <IonRouterOutlet>
        <Route path="/" component={Home} />
      </IonRouterOutlet>
    </>
  )
}

export default ThreePaneUI