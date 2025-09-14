import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/db/mongodb';
import EmailTemplate from '../../../../lib/db/models/EmailTemplate';
import { defaultTemplates } from '../../../../lib/api/defaultEmailTemplates';

async function seedDefaultTemplates() {
  try {
    const existingTemplates = await EmailTemplate.find({});

    let seededCount = 0;
    let skippedCount = 0;

    for (const templateData of defaultTemplates) {
      try {
        // Check if template already exists
        const existingTemplate = await EmailTemplate.findOne({
          type: templateData.type,
          name: templateData.name
        });

        if (!existingTemplate) {
          try {
            const template = new EmailTemplate({
              ...templateData,
              isActive: true,
            });
            // Temporarily disable validation for seeding
            await template.save({ validateBeforeSave: false });
            seededCount++;
          } catch (saveError) {
            console.error(`❌ Failed to save template ${templateData.name}:`, saveError);
            // Try to update existing template if it exists but has validation issues
            try {
              const existingWithType = await EmailTemplate.findOne({ type: templateData.type });
              if (existingWithType) {
                existingWithType.name = templateData.name;
                existingWithType.subject = templateData.subject;
                existingWithType.htmlContent = templateData.htmlContent;
                existingWithType.textContent = templateData.textContent;
                existingWithType.variables = templateData.variables;
                existingWithType.isActive = true;
                await existingWithType.save();
              }
            } catch (updateError) {
              console.error(`❌ Failed to update existing template ${templateData.name}:`, updateError);
            }
          }
        } else {
          skippedCount++;
        }
      } catch (templateError) {
        console.error(`❌ Error seeding template ${templateData.name}:`, templateError);
      }
    }

    // Final count
    const finalTemplates = await EmailTemplate.find({});

  } catch (error) {
    console.error('❌ Error in seedDefaultTemplates function:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Automatically seed default templates if they don't exist
    await seedDefaultTemplates();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const query: Record<string, string | boolean> = {};
    if (type) query.type = type;
    if (activeOnly) query.isActive = true;

    const templates = await EmailTemplate.find(query)
      .sort({ createdAt: -1 });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Get email templates error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, type, subject, htmlContent, textContent, variables, createdBy } = await request.json();

    if (!name || !type || !subject || !htmlContent) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();

    const newTemplate = new EmailTemplate({
      name,
      type,
      subject,
      htmlContent,
      textContent,
      variables: variables || [],
      createdBy,
    });

    await newTemplate.save();

    return NextResponse.json({
      success: true,
      message: 'Email template created successfully',
      template: newTemplate
    });
  } catch (error) {
    console.error('Create email template error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
