import SessionDetailPage from '@/components/admin/session-detail-page'

export default function ActivitesLibresDetailPage() {
  return (
    <SessionDetailPage
      sessionType="activites-libres"
      labels={{
        groupSingular: 'Groupe',
        groupPlural: 'Groupes',
        newGroup: 'Nouveau groupe',
        createGroup: 'Nouveau groupe',
        editGroup: 'Modifier le groupe',
        deleteGroupConfirm: 'Voulez-vous vraiment supprimer ce groupe ?',
        assignToGroup: 'Assigner au groupe',
        removeFromGroup: 'Retirer du groupe',
        noGroupsTab: 'Groupes'
      }}
    />
  )
}
