import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db-service';
import { styles } from '../styles';
import type { Fee, FeeAssignment } from '../../../shared/schema';
import { useAuth } from '../services/auth-service';

type Member = {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  orgId: string;
};

export const FeesPage = () => {
  const { user } = useAuth();
  const [orgId, setOrgId] = useState<string>('');
  const [fees, setFees] = useState<Fee[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [assignments, setAssignments] = useState<Record<string, FeeAssignment[]>>({});
  const [selectedFee, setSelectedFee] = useState<string>('');
  const [assignToAll, setAssignToAll] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<{assignment: FeeAssignment, fee: Fee} | null>(null);

  useEffect(() => {
    loadOrganization();
  }, [user]);

  useEffect(() => {
    if (orgId) {
      console.log('Organization loaded, orgId:', orgId);
      loadFees();
      loadMembers();
    }
  }, [orgId]);

  useEffect(() => {
    console.log('Current members state:', members);
  }, [members]);

  async function loadOrganization() {
    if (!user) return;
    const org = await dbService.getUserOrganization(user.uid);
    if (org?.id) {
      setOrgId(org.id);
    }
  }

  useEffect(() => {
    if (selectedFee) {
      loadFeeAssignments(selectedFee);
    }
  }, [selectedFee]);

  async function loadFees() {
    const feesData = await dbService.getFees(orgId);
    setFees(feesData);
  }

  async function loadMembers() {
    try {
      console.log('Loading members for org:', orgId);
      const membersData = await dbService.getMembers(orgId);
      console.log('Loaded members:', membersData);
      if (Array.isArray(membersData)) {
        setMembers(membersData);
      } else {
        console.error('Unexpected members data format:', membersData);
        setMembers([]);
      }
    } catch (error) {
      console.error('Error loading members:', error);
      setMembers([]);
    }
  }

  async function loadFeeAssignments(feeId: string) {
    const assignmentsData = await dbService.getFeeAssignments(feeId);
    setAssignments(prev => ({
      ...prev,
      [feeId]: assignmentsData
    }));
  }

  async function handleAddFee(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    let memberIds: string[] = [];
    if (assignToAll) {
      memberIds = members.map(m => m.id);
    } else {
      memberIds = Array.from(formData.getAll('memberIds')).map(String);
    }

    await dbService.addFee({
      name: formData.get('name') as string,
      amount: Number(formData.get('amount')),
      dueDate: new Date(formData.get('dueDate') as string),
      memberIds,
      orgId
    });

    form.reset();
    setAssignToAll(false);
    loadFees();
  }

  async function handlePayFee(assignment: FeeAssignment, fee: Fee) {
    setSelectedAssignment({ assignment, fee });
    setShowPaymentModal(true);
  }

  async function handlePaymentSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedAssignment) return;

    const form = e.currentTarget;
    const formData = new FormData(form);
    const { assignment } = selectedAssignment;
    
    if (!assignment.id) return;
    await dbService.updateFeeAssignment(assignment.id, {
      isPaid: true,
      paidDate: new Date(),
      paymentMethod: formData.get('paymentMethod') as any,
      notes: formData.get('notes') as string || undefined
    });

    await loadFeeAssignments(assignment.feeId);
    setShowPaymentModal(false);
    setSelectedAssignment(null);
    form.reset();
  }

  // Component-specific styles that extend shared styles
  const componentStyles = {
    memberList: {
      maxHeight: '200px',
      overflowY: 'auto' as const,
      border: '1px solid #ddd',
      borderRadius: '4px',
      padding: '8px'
    },
    memberItem: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '4px'
    },
    checkbox: {
      marginRight: '8px'
    },
    feeList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px'
    },
    feeCard: {
      ...styles.card,
      marginBottom: '16px'
    },
    feeHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'start',
      marginBottom: '8px'
    },
    assignmentCard: (isPaid: boolean) => ({
      padding: '12px',
      borderRadius: '4px',
      background: isPaid ? '#dcfce7' : '#f3f4f6',
      border: `1px solid ${isPaid ? '#bbf7d0' : '#ddd'}`
    })
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Fees</h2>
      </div>

      <form onSubmit={handleAddFee} style={styles.form}>
        <h3 style={styles.boldText}>Add New Fee</h3>
        <input
          name="name"
          type="text"
          placeholder="Fee name"
          required
          style={styles.input}
        />
        <input
          name="amount"
          type="number"
          min="0"
          step="0.01"
          placeholder="Amount"
          required
          style={styles.input}
        />
        <input
          name="dueDate"
          type="date"
          required
          style={styles.input}
        />

        <label style={componentStyles.memberItem}>
          <input
            type="checkbox"
            checked={assignToAll}
            onChange={(e) => setAssignToAll(e.target.checked)}
            style={componentStyles.checkbox}
          />
          <span style={styles.label}>
            Assign to all members
          </span>
        </label>

        {!assignToAll && (
          <div style={componentStyles.memberList}>
            {members.length === 0 ? (
              <div style={styles.text}>No members found</div>
            ) : (
              members.map(member => (
                <label key={member.id} style={componentStyles.memberItem}>
                  <input
                    type="checkbox"
                    name="memberIds"
                    value={member.id}
                    style={componentStyles.checkbox}
                  />
                  <span style={styles.label}>{member.name}</span>
                </label>
              ))
            )}
          </div>
        )}

        <button type="submit" style={styles.button}>
          Add Fee
        </button>
      </form>

      <div style={componentStyles.feeList}>
        {fees.map(fee => (
          <div key={fee.id} style={componentStyles.feeCard}>
            <div style={componentStyles.feeHeader}>
              <div>
                <div style={styles.boldText}>{fee.name}</div>
                <div style={styles.text}>Due: {new Date(fee.dueDate).toLocaleDateString()}</div>
                <div style={{...styles.boldText, color: '#3b82f6'}}>${fee.amount}</div>
              </div>
              <button
                onClick={() => setSelectedFee(selectedFee === fee.id ? '' : fee.id || '')}
                style={styles.button}
              >
                {selectedFee === fee.id ? 'Hide Details' : 'Show Details'}
              </button>
            </div>

            {selectedFee === fee.id && assignments[fee.id] && (
              <div style={styles.grid}>
                {assignments[fee.id].map(assignment => {
                  const member = members.find(m => m.id === assignment.memberId);
                  return (
                    <div
                      key={assignment.id}
                      style={componentStyles.assignmentCard(assignment.isPaid)}
                    >
                      <div style={styles.boldText}>{member?.name}</div>
                      <div style={styles.text}>
                        {assignment.isPaid ? (
                          <>
                            <div>Paid on {assignment.paidDate?.toLocaleDateString()}</div>
                            {assignment.paymentMethod && (
                              <div>Method: {assignment.paymentMethod.replace('_', ' ')}</div>
                            )}
                            {assignment.notes && (
                              <div>Notes: {assignment.notes}</div>
                            )}
                          </>
                        ) : (
                          'Not paid'
                        )}
                      </div>
                      {!assignment.isPaid && (
                        <button
                          onClick={() => handlePayFee(assignment, fee)}
                          style={{...styles.button, marginTop: '8px'}}
                        >
                          Mark as Paid
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {showPaymentModal && selectedAssignment && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={styles.title}>Process Payment</h3>
            <form onSubmit={handlePaymentSubmit} style={styles.form}>
              <div style={styles.text}>
                Process payment for {selectedAssignment.fee.name}
              </div>
              <select
                name="paymentMethod"
                required
                defaultValue=""
                style={styles.select}
              >
                <option value="" disabled>Select payment method</option>
                <option value="CASH">Cash</option>
                <option value="CHECK">Check</option>
                <option value="VENMO">Venmo</option>
                <option value="ZELLE">Zelle</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="OTHER">Other</option>
              </select>
              <textarea
                name="notes"
                placeholder="Additional notes (optional)"
                style={styles.input}
                rows={3}
              />
              <div style={styles.modalButtons}>
                <button type="submit" style={styles.button}>
                  Process Payment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedAssignment(null);
                  }}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
