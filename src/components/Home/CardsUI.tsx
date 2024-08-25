import Inbox from "./Cards/Inbox"
import LogbookCard from "./Cards/Logbook"
import NotesCard from "./Cards/Notes"
import ProjectsCard from "./Cards/Projects"
import Today from "./Cards/Today"
import UpcomingCard from "./Cards/Upcoming"
import Welcome from "./Cards/Welcome"

const HomeCardsUI = () => {
  return (
    <>
      <Welcome />
      <Today /> 
      <Inbox />
      <UpcomingCard />
      <ProjectsCard />
      <NotesCard />
      <LogbookCard />
    </>
  )
}

export default HomeCardsUI