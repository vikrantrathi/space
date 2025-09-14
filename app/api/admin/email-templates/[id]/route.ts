import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../../../lib/db/mongodb';
import EmailTemplate from '../../../../../lib/db/models/EmailTemplate';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const template = await EmailTemplate.findById(id);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Get email template error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, type, subject, htmlContent, textContent, variables, isActive, updatedBy } = await request.json();

    if (!name || !type || !subject || !htmlContent) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();

    const updatedTemplate = await EmailTemplate.findByIdAndUpdate(
      id,
      {
        name,
        type,
        subject,
        htmlContent,
        textContent,
        variables: variables || [],
        isActive: isActive !== undefined ? isActive : true,
        updatedBy,
      },
      { new: true }
    );

    if (!updatedTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Email template updated successfully',
      template: updatedTemplate
    });
  } catch (error) {
    console.error('Update email template error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const deletedTemplate = await EmailTemplate.findByIdAndDelete(id);
    if (!deletedTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Email template deleted successfully'
    });
  } catch (error) {
    console.error('Delete email template error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}