import SessionDetailPage from '@/components/admin/session-detail-page'

export default function AteliersDetailPage() {
  return (
    <SessionDetailPage
      sessionType="ateliers"
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
