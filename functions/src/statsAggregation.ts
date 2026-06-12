import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';

/**
 * Firestore trigger: maintains a global stats doc that gets updated whenever
 * an incident is created, updated, or deleted.
 * This replaces client-side counting over full collection downloads,
 * enabling dashboards to read a single doc instead of fetching all incidents.
 *
 * Updates stats/global with:
 * - totalReports
 * - activeReports (status != 'Resolved')
 * - criticalReports (severity == 'Critical')
 * - resolvedReports
 * - lastUpdated
 */
export const onIncidentWrite = onDocumentWritten(
  {
    document: 'incidents/{docId}',
    region: 'europe-west1',
  },
  async (event) => {
    const db = getFirestore();
    const statsRef = db.collection('stats').doc('global');

    const before = event.data?.before.data() as any;
    const after = event.data?.after.data() as any;

    const isDelete = !after;
    const isCreate = !before;

    const increment = admin.firestore.FieldValue.increment(1);
    const decrement = admin.firestore.FieldValue.increment(-1);

    try {
      // Determine status changes for active/critical counts
      const beforeStatus = before?.status;
      const afterStatus = after?.status;
      const beforeSeverity = before?.severity;
      const afterSeverity = after?.severity;

      const updateData: any = {
        lastUpdated: new Date(),
      };

      // Total reports delta
      if (isCreate) {
        updateData.totalReports = increment;
      } else if (isDelete) {
        updateData.totalReports = decrement;
      }

      // Active reports (status != 'Resolved')
      if (isCreate && afterStatus !== 'Resolved') {
        updateData.activeReports = increment;
      } else if (isDelete && beforeStatus !== 'Resolved') {
        updateData.activeReports = decrement;
      } else if (!isCreate && !isDelete && beforeStatus !== afterStatus) {
        if (beforeStatus !== 'Resolved' && afterStatus === 'Resolved') {
          updateData.activeReports = decrement;
        } else if (beforeStatus === 'Resolved' && afterStatus !== 'Resolved') {
          updateData.activeReports = increment;
        }
      }

      // Critical reports (severity == 'Critical')
      if (isCreate && afterSeverity === 'Critical') {
        updateData.criticalReports = increment;
      } else if (isDelete && beforeSeverity === 'Critical') {
        updateData.criticalReports = decrement;
      } else if (!isCreate && !isDelete && beforeSeverity !== afterSeverity) {
        if (beforeSeverity === 'Critical') {
          updateData.criticalReports = decrement;
        }
        if (afterSeverity === 'Critical') {
          updateData.criticalReports = increment;
        }
      }

      // Resolved reports
      if (isCreate && afterStatus === 'Resolved') {
        updateData.resolvedReports = increment;
      } else if (isDelete && beforeStatus === 'Resolved') {
        updateData.resolvedReports = decrement;
      } else if (!isCreate && !isDelete && beforeStatus !== afterStatus) {
        if (beforeStatus !== 'Resolved' && afterStatus === 'Resolved') {
          updateData.resolvedReports = increment;
        } else if (beforeStatus === 'Resolved' && afterStatus !== 'Resolved') {
          updateData.resolvedReports = decrement;
        }
      }

      // Update or create stats doc
      await statsRef.set(updateData, { merge: true });

      logger.info('Stats updated', {
        action: isCreate ? 'create' : isDelete ? 'delete' : 'update',
        updatedFields: Object.keys(updateData),
      });
    } catch (error) {
      logger.error('Error updating stats', { error });
      // Don't throw — this is a non-critical enhancement
    }
  }
);
