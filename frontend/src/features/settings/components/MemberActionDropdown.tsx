import React, { useState, useRef, useEffect } from 'react';
import { FamilyMember } from '../../../types.js';

interface MemberActionDropdownProps {
  member: FamilyMember;
  currentUserRole?: FamilyMember['role'];
  currentUserId?: string;
  onPromoteToAdmin?: (memberId: string) => void;
  onDemoteToResident?: (memberId: string) => void;
  onTransferGeneralAdmin?: (member: FamilyMember) => void;
  onRemoveMember?: (memberId: string, memberName: string) => void;
}

export const MemberActionDropdown: React.FC<MemberActionDropdownProps> = ({
  member,
  currentUserRole,
  currentUserId,
  onPromoteToAdmin,
  onDemoteToResident,
  onTransferGeneralAdmin,
  onRemoveMember,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isGeneralAdmin = currentUserRole === 'Admin Geral';
  const isAdmin = currentUserRole === 'Admin';
  const isTargetGeneralAdmin = member.role === 'Admin Geral' || member.isPrimary;
  const isTargetAdmin = member.role === 'Admin';
  const isTargetResident = member.role === 'Resident' || !member.role;
  const isSelf = member.id === currentUserId;

  const canRemove =
    !isSelf &&
    ((isGeneralAdmin && !isTargetGeneralAdmin) ||
      (isAdmin && !isTargetGeneralAdmin && !isTargetAdmin));

  const hasAnyAction =
    !isSelf &&
    ((isGeneralAdmin && !isTargetGeneralAdmin) || canRemove);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!hasAnyAction) {
    return null;
  }

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`p-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
          isOpen
            ? 'bg-[#ffca5e] text-[#755400] shadow-sm'
            : 'text-current opacity-75 hover:opacity-100 hover:bg-white/10'
        }`}
        title="Opções do membro"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="material-symbols-outlined text-lg leading-none">more_vert</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-52 bg-[#16302e] border border-[#2d4644] rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md">
          {/* Ações de Governança Exclusivas do Admin Geral */}
          {isGeneralAdmin && isTargetResident && onPromoteToAdmin && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onPromoteToAdmin(member.id);
              }}
              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-[#e4f0ee] hover:bg-[#234441] flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm text-[#ffca5e]">shield_person</span>
              <span>Promover a Admin</span>
            </button>
          )}

          {isGeneralAdmin && isTargetAdmin && onDemoteToResident && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onDemoteToResident(member.id);
              }}
              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-amber-200 hover:bg-[#234441] flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm text-[#ffca5e]">arrow_downward</span>
              <span>Despromover a Morador</span>
            </button>
          )}

          {isGeneralAdmin && !isTargetGeneralAdmin && onTransferGeneralAdmin && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onTransferGeneralAdmin(member);
              }}
              className="w-full text-left px-3.5 py-2 text-xs font-bold text-[#ffca5e] hover:bg-[#ffca5e]/10 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">crown</span>
              <span>Passar Admin Geral</span>
            </button>
          )}

          {canRemove && onRemoveMember && (
            <>
              {isGeneralAdmin && <div className="border-t border-[#2d4644] my-1" />}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onRemoveMember(member.id, member.name);
                }}
                className="w-full text-left px-3.5 py-2 text-xs font-bold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">person_remove</span>
                <span>Remover da Casa</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
