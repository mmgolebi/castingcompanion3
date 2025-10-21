// GoHighLevel API Integration

interface GHLContact {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  tags?: string[];
  customFields?: Record<string, string>;
}

export async function createOrUpdateGHLContact(contact: GHLContact) {
  const GHL_API_KEY = process.env.GHL_API_KEY;
  const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

  if (!GHL_API_KEY || !GHL_LOCATION_ID) {
    console.warn('GHL credentials not configured');
    return null;
  }

  try {
    const [firstName, ...lastNameParts] = (contact.firstName || '').split(' ');
    const lastName = lastNameParts.join(' ') || contact.lastName || '';

    // Format phone with +1 if it doesn't have it
    let formattedPhone = contact.phone || '';
    if (formattedPhone && !formattedPhone.startsWith('+')) {
      const digitsOnly = formattedPhone.replace(/\D/g, '');
      if (digitsOnly.length === 10) {
        formattedPhone = `+1${digitsOnly}`;
      } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
        formattedPhone = `+${digitsOnly}`;
      }
    }

    console.log('Sending to GHL:', { 
      email: contact.email, 
      firstName, 
      phone: formattedPhone,
      tags: contact.tags
    });

    const response = await fetch(
      `https://rest.gohighlevel.com/v1/contacts/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: contact.email,
          firstName: firstName || 'Unknown',
          lastName: lastName || '',
          phone: formattedPhone,
          tags: contact.tags || [],
          customField: contact.customFields || {},
        }),
      }
    );

    const responseText = await response.text();
    console.log('GHL Response status:', response.status);
    console.log('GHL Response body:', responseText);

    if (!response.ok) {
      console.error('GHL API error:', responseText);
      return null;
    }

    const data = JSON.parse(responseText);
    console.log('GHL contact created/updated:', data);
    return data;
  } catch (error) {
    console.error('Error sending to GHL:', error);
    return null;
  }
}

export async function addGHLTag(email: string, tag: string, allTags?: string[]) {
  const GHL_API_KEY = process.env.GHL_API_KEY;

  if (!GHL_API_KEY) {
    return null;
  }

  try {
    console.log('[GHL] Adding tag:', tag, 'to', email);
    
    // If allTags provided, use them; otherwise just send the new tag
    const tagsToSend = allTags || [tag];

    console.log('[GHL] Sending tags:', tagsToSend);

    const response = await fetch(
      `https://rest.gohighlevel.com/v1/contacts/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          tags: tagsToSend,
        }),
      }
    );

    const responseText = await response.text();
    console.log('[GHL] Tag add response status:', response.status);
    console.log('[GHL] Tag add response body:', responseText);

    if (!response.ok) {
      console.error('[GHL] Tag add error:', responseText);
      return null;
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error('[GHL] Error adding tag:', error);
    return null;
  }
}
