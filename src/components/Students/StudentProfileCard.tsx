/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import {
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Briefcase,
  GraduationCap,
  Monitor,
  Users,
  Edit2,
  X,
  Check,
  Loader2,
} from 'lucide-react';
import type { StudentWithRelations } from '@/types';
import { getStatusBadgeClass } from '@/lib/ui-helpers';
import { StudentAvatar } from './StudentAvatar';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/Modal';
import { studentApi } from '@/lib/api-client';
import toast from 'react-hot-toast';

interface StudentProfileCardProps {
  student: StudentWithRelations;
  onUpdate?: () => void;
}

export function StudentProfileCard({ student, onUpdate }: StudentProfileCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: student.phone || '',
    whatsapp: student.whatsapp || '',
    mentorshipJoiningStatus: student.mentorshipJoiningStatus || false,
  });

  // Local state for instant UI updates
  const [displayedData, setDisplayedData] = useState({
    phone: student.phone || '',
    whatsapp: student.whatsapp || '',
    mentorshipJoiningStatus: student.mentorshipJoiningStatus || false,
  });

  const rows = [
    { icon: Phone, label: 'Phone', value: displayedData.phone },
    { icon: MessageCircle, label: 'WhatsApp', value: displayedData.whatsapp },
    {
      icon: MapPin,
      label: 'Location',
      value: [student.town, student.district, student.division].filter(Boolean).join(', ') || null,
    },
    { icon: Briefcase, label: 'Occupation', value: student.occupation },
    { icon: GraduationCap, label: 'Institute', value: student.institute },
    { icon: Monitor, label: 'Device', value: student.workingDevice },
    { icon: Users, label: 'Age Range', value: student.ageRange },
  ];

  const handleEditClick = () => {
    setFormData({
      phone: student.phone || '',
      whatsapp: student.whatsapp || '',
      mentorshipJoiningStatus: student.mentorshipJoiningStatus || false,
    });
    setIsEditModalOpen(true);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!student._id) {
      toast.error('Student ID not found');
      return;
    }

    try {
      setIsLoading(true);

      const response = await studentApi.update(student._id, {
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        mentorshipJoiningStatus: formData.mentorshipJoiningStatus,
      });

      if (response?.error) {
        throw new Error(response.error);
      }

      // Instant UI update with new values
      setDisplayedData({
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        mentorshipJoiningStatus: formData.mentorshipJoiningStatus,
      });

      toast.success('Student information updated successfully');
      setIsEditModalOpen(false);
      onUpdate?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update student';
      toast.error(message);
      console.error('Student update error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-6 flex flex-col items-center text-center border-b bg-muted/20 relative">
        <button
          onClick={handleEditClick}
          className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
          title="Edit basic info"
        >
          <Edit2 className="w-5 h-5 text-muted-foreground" />
        </button>
        <StudentAvatar name={student.name} size="lg" className="mb-3" />
        <h2 className="text-xl font-bold">{student.name}</h2>
        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
          <Mail className="w-3 h-3" />
          {student.email}
        </p>
        <div className="flex items-center gap-2 mt-3">
          <span
            className={`inline-flex px-2.5 py-1 rounded text-xs font-semibold border ${getStatusBadgeClass(student.currentStatus!)}`}
          >
            {student.currentStatus}
          </span>
          {displayedData.mentorshipJoiningStatus ? (
            <span className="inline-flex px-2.5 py-1 rounded text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
              In Group
            </span>
          ) : (
            <span className="inline-flex px-2.5 py-1 rounded text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
              Not in Group
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="px-5 py-4 space-y-3">
        {rows.map(({ icon: Icon, label, value }) =>
          value ? (
            <div key={label} className="flex items-start gap-3 text-sm">
              <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex justify-between w-full gap-2">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium text-right">{value}</span>
              </div>
            </div>
          ) : null
        )}
      </div>

      {/* Comments */}
      {student.comments && student.comments.length > 0 && (
        <div className="px-5 py-4 border-t bg-muted/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Notes
          </p>
          <ul className="space-y-1">
            {student.comments.map((c, i) => (
              <li key={i} className="text-sm text-muted-foreground">
                • {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <ModalHeader title="Edit Basic Information" onClose={() => setIsEditModalOpen(false)} />
        <ModalBody>
          <div className="space-y-4">
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter phone number"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                WhatsApp Number
              </label>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter WhatsApp number (optional)"
              />
            </div>

            {/* Mentorship Status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="mentorshipStatus"
                checked={formData.mentorshipJoiningStatus}
                onChange={(e) => handleInputChange('mentorshipJoiningStatus', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
              <label
                htmlFor="mentorshipStatus"
                className="text-sm font-medium text-foreground cursor-pointer"
              >
                In Mentorship Group
              </label>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <button
            onClick={() => setIsEditModalOpen(false)}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
