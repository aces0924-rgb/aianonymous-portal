import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const eventId = resolvedParams.id;
  
  // Verify Admin
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  if (session?.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const enableHostSection = formData.get('enableHostSection') === 'true';
    const hostsStr = formData.get('hosts') as string;
    const hosts = JSON.parse(hostsStr || '[]');

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Update featureFlags
    const featureFlags = JSON.parse(event.featureFlags || '{}');
    featureFlags.enableHostSection = enableHostSection;

    // We can store hosts inside labelConfig or a new JSON field. Since Event model might not have a hosts field,
    // let's just store it in labelConfig to avoid schema migration, or we can see if hostConfig exists.
    // The easiest is labelConfig.hosts since labelConfig is already JSON.
    const labelConfig = JSON.parse(event.labelConfig || '{}');
    labelConfig.hosts = hosts;

    await prisma.event.update({
      where: { id: eventId },
      data: {
        featureFlags: JSON.stringify(featureFlags),
        labelConfig: JSON.stringify(labelConfig)
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating hosts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
