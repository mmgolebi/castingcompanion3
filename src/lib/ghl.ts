// GoHighLevel API Integration

interface GHLContact {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  tags?: string[];
  customFields?: Record<string, string>;
}

// Helper function to get existing contact
async function getExistingContact(email: string, apiKey: string) {
  try {
    const response = await fetch(
      `https://rest.gohighlevel.com/v1/contacts/lookup?email=${encodeURIComponent(email)}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.contact;
    }
    return null;
  } catch (error) {
    console.error('Error looking up contact:', error);
    return null;
  }
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

    // Get existing contact to preserve tags
    const existingContact = await getExistingContact(contact.email, GHL_API_KEY);
    const existingTags = existingContact?.tags || [];
    
    // Merge new tags with existing tags (remove duplicates)
    const mergedTags = [...new Set([...existingTags, ...(contact.tags || [])])];

    console.log('Sending to GHL:', { 
      email: contact.email, 
      firstName, 
      phone: formattedPhone,
      existingTags,
      newTags: contact.tags,
      mergedTags
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
          tags: mergedTags, // Use merged tags
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

export async function addGHLTag(email: string, tag: string) {
  const GHL_API_KEY = process.env.GHL_API_KEY;

  if (!GHL_API_KEY) {
    return null;
  }

  try {
    console.log('Adding GHL tag:', tag, 'to', email);

    // Get existing contact to preserve tags
    const existingContact = await getExistingContact(email, GHL_API_KEY);
    const existingTags = existingContact?.tags || [];
    
    // Add new tag to existing tags
    const updatedTags = [...new Set([...existingTags, tag])];

    console.log('Existing tags:', existingTags, '→ Updated tags:', updatedTags);

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
          tags: updatedTags, // Use merged tags
        }),
      }
    );

    const responseText = await response.text();
    console.log('GHL tag response:', response.status, responseText);

    if (!response.ok) {
      console.error('GHL tag error:', responseText);
      return null;
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error('Error adding GHL tag:', error);
    return null;
  }
}
