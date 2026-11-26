'use client';

import React, { useMemo, useRef } from 'react';
import { Copy, Download, MessageSquare, Share2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { resolveLocationNames } from '@/data/bangladesh-locations';
import { useToast } from '@/context/ToastContext';
import { useTranslation } from '@/i18n/context';
import { BLOOD_GROUP_LABELS } from '@/lib/donor-ranking';
import { buildSocialShareTemplate } from '@/lib/request-lifecycle';
import type { BloodRequestItem } from '@/types';

interface SocialShareModalProps {
  request: BloodRequestItem | null;
  onClose: () => void;
}

export function SocialShareModal({ request, onClose }: SocialShareModalProps) {
  const { lang, t } = useTranslation();
  const { showToast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const shareText = useMemo(() => {
    if (!request) return '';
    return buildSocialShareTemplate(request, lang);
  }, [request, lang]);

  if (!request) return null;

  const bloodLabel = BLOOD_GROUP_LABELS[request.bloodGroupNeeded];
  const loc = resolveLocationNames(
    {
      divisionId: request.divisionId,
      districtId: request.districtId,
      upazilaId: request.upazilaId,
      postOfficeId: request.postOfficeId ?? undefined,
      villageOrArea: request.villageOrArea,
    },
    lang
  );

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      showToast(t.toasts.textCopied, 'success');
    } catch {
      showToast(t.toasts.textCopied, 'info');
    }
  };

  const handleDownloadPoster = () => {
    const canvas = canvasRef.current ?? document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 1080, 1080);

    // Top crimson emergency banner
    ctx.fillStyle = '#B91C1C';
    ctx.fillRect(0, 0, 1080, 210);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText(t.shareModal.bannerHeader, 64, 92);

    ctx.font = '600 28px sans-serif';
    ctx.fillStyle = '#FEE2E2';
    ctx.fillText(t.requestForm.urgencyOptions[request.urgencyLevel], 64, 150);

    // Blood Group Badge Box
    ctx.fillStyle = '#991B1B';
    ctx.fillRect(830, 38, 186, 134);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 74px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(bloodLabel, 923, 128);
    ctx.textAlign = 'left';

    // Body details
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 42px sans-serif';
    ctx.fillText(`${request.patientName}`, 64, 300);

    ctx.fillStyle = '#475569';
    ctx.font = '600 30px sans-serif';
    const lines = [
      `${t.requestForm.unitsRequired}: ${request.unitsRequired} ${t.common.bags}`,
      `${t.requestForm.hospitalName}: ${request.hospitalName}`,
      `${t.requestBoard.wardLabel}: ${request.wardCabinBed}`,
      `${t.location.upazila}: ${loc.fullBreadcrumb || loc.compact}`,
      `${t.requestBoard.reasonLabel}: ${request.medicalReason}`,
    ];
    let y = 380;
    for (const line of lines) {
      ctx.fillText(line.slice(0, 56), 64, y);
      y += 66;
    }

    // Contact highlight box
    ctx.fillStyle = '#ECFDF5';
    ctx.fillRect(64, 740, 952, 170);
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 4;
    ctx.strokeRect(64, 740, 952, 170);

    ctx.fillStyle = '#065F46';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText(`${t.requestBoard.contactLabel}: ${request.contactPersonName}`, 96, 805);
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText(
      `${request.primaryMobile}${request.alternateMobile ? ` / ${request.alternateMobile}` : ''}`,
      96,
      872
    );

    // Footer
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 980, 1080, 100);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '600 26px sans-serif';
    ctx.fillText(t.shareModal.bannerFooter, 64, 1040);

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `blood-needed-${bloodLabel.replace('+', 'pos').replace('-', 'neg')}.png`;
    a.click();
    showToast(t.toasts.bannerDownloaded, 'success');
  };

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const appUrl =
    typeof window !== 'undefined' ? window.location.href : 'https://roktobondhu-bd.vercel.app';
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    appUrl
  )}&quote=${encodeURIComponent(shareText)}`;
  const messengerShareUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(
    appUrl
  )}&app_id=140586622674265&redirect_uri=${encodeURIComponent(appUrl)}`;

  return (
    <Modal
      isOpen={Boolean(request)}
      onClose={onClose}
      title={t.shareModal.title}
      subtitle={t.shareModal.subtitle}
      maxWidthClass="max-w-3xl"
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Graphical Banner Snippet Preview */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
          <div className="flex items-center justify-between bg-crimson-700 px-4 py-3 text-white">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-crimson-100">
                {t.shareModal.bannerHeader}
              </p>
              <p className="text-xs font-semibold text-white/90">
                {t.requestForm.urgencyOptions[request.urgencyLevel]}
              </p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-crimson-900 text-lg font-extrabold shadow">
              {bloodLabel}
            </span>
          </div>

          <div className="space-y-2 p-4 text-xs text-slate-700">
            <p className="text-base font-extrabold text-slate-900">{request.patientName}</p>
            <p>
              <strong className="text-slate-900">{t.requestForm.unitsRequired}:</strong>{' '}
              {request.unitsRequired} {t.common.bags}
            </p>
            <p>
              <strong className="text-slate-900">{t.requestForm.hospitalName}:</strong>{' '}
              {request.hospitalName} ({request.wardCabinBed})
            </p>
            <p>
              <strong className="text-slate-900">{t.location.upazila}:</strong>{' '}
              {loc.fullBreadcrumb || loc.compact}
            </p>
            <p>
              <strong className="text-slate-900">{t.requestBoard.reasonLabel}:</strong>{' '}
              {request.medicalReason}
            </p>
            <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-emerald-900">
              <p className="font-bold">
                {t.requestBoard.contactLabel}: {request.contactPersonName}
              </p>
              <p className="font-mono text-sm font-extrabold">
                {request.primaryMobile}
                {request.alternateMobile ? ` / ${request.alternateMobile}` : ''}
              </p>
            </div>
          </div>
          <div className="bg-slate-900 px-4 py-2 text-[11px] font-medium text-slate-200">
            {t.shareModal.bannerFooter}
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Share Text & 1-Click Actions */}
        <div className="flex flex-col justify-between gap-3">
          <div>
            <textarea
              readOnly
              rows={10}
              value={shareText}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 font-mono text-xs leading-relaxed text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
            >
              <Copy className="h-4 w-4" />
              <span>{t.shareModal.copyTextBtn}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPoster}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-crimson-700 px-3 py-2.5 text-xs font-bold text-white hover:bg-crimson-800"
            >
              <Download className="h-4 w-4" />
              <span>{t.shareModal.downloadBannerBtn}</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 px-2.5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{t.shareModal.shareWhatsapp}</span>
            </a>
            <a
              href={facebookShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 rounded-xl bg-blue-600 px-2.5 py-2 text-xs font-bold text-white hover:bg-blue-700"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>{t.shareModal.shareFacebook}</span>
            </a>
            <a
              href={messengerShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 rounded-xl bg-indigo-600 px-2.5 py-2 text-xs font-bold text-white hover:bg-indigo-700"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{t.shareModal.shareMessenger}</span>
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
}
