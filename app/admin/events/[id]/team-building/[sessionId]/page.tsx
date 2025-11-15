import SessionDetailPage from '@/components/admin/session-detail-page'

export default function TeamBuildingDetailPage() {
  return (
    <SessionDetailPage
      sessionType="team-building"
      labels={{
        groupSingular: 'Équipe',
        groupPlural: 'Équipes',
        newGroup: 'Nouvelle équipe',
        createGroup: 'Nouvelle équipe',
        editGroup: 'Modifier l\'équipe',
        deleteGroupConfirm: 'Voulez-vous vraiment supprimer cette équipe ?',
        assignToGroup: 'Assigner à l\'équipe',
        removeFromGroup: 'Retirer de l\'équipe',
        noGroupsTab: 'Équipes'
      }}
    />
  )
}
