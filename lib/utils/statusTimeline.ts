import { IQuotation } from '../db/models/Quotation';

export interface StatusTimelineEntry {
  status: string;
  date: Date;
  description: string;
}

export const updateStatusTimeline = (quotation: IQuotation, status: string, description: string): StatusTimelineEntry[] => {
  const timeline = quotation.statusTimeline || [];
  
  // Check if this status already exists in the timeline
  const existingEntry = timeline.find(entry => entry.status === status);
  
  if (existingEntry) {
    // Update existing entry
    existingEntry.date = new Date();
    existingEntry.description = description;
  } else {
    // Add new entry
    timeline.push({
      status,
      date: new Date(),
      description
    });
  }
  
  // Sort timeline by date
  return timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const getStatusTimelineDescription = (status: string, action?: string, reason?: string): string => {
  switch (status) {
    case 'draft':
      return 'Quotation created and saved as draft';
    case 'sent':
      return 'Quotation sent to client for review';
    case 'accepted':
      return action === 'accept' 
        ? `Quotation accepted by client${reason ? ` - ${reason}` : ''}`
        : 'Quotation accepted';
    case 'rejected':
      return action === 'reject'
        ? `Quotation rejected by client${reason ? ` - ${reason}` : ''}`
        : 'Quotation rejected';
    case 'revision':
      if (action === 'revision') {
        if (reason === 'Admin sent revised quotation to client' || reason === 'Admin updated quotation based on revision request') {
          return 'Revision received from admin';
        }
        return `Revision requested by client${reason ? ` - ${reason}` : ''}`;
      }
      return 'Quotation sent for revision';
    default:
      return `Status changed to ${status}`;
  }
};

export const initializeStatusTimeline = (quotation: IQuotation): StatusTimelineEntry[] => {
  const timeline: StatusTimelineEntry[] = [];
  
  // Add creation entry
  timeline.push({
    status: 'draft',
    date: quotation.createdAt || new Date(),
    description: 'Quotation created and saved as draft'
  });
  
  // Add sent entry if status is sent or beyond
  if (['sent', 'accepted', 'rejected', 'revision'].includes(quotation.status)) {
    timeline.push({
      status: 'sent',
      date: quotation.updatedAt || new Date(),
      description: 'Quotation sent to client for review'
    });
  }
  
  // Add current status entry if it's not draft or sent
  if (['accepted', 'rejected', 'revision'].includes(quotation.status)) {
    timeline.push({
      status: quotation.status,
      date: quotation.updatedAt || new Date(),
      description: getStatusTimelineDescription(quotation.status)
    });
  }
  
  return timeline;
};
